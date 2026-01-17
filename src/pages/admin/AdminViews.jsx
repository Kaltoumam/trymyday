import { useState } from 'react';
import { Table, Badge, Button, Modal, Form, InputGroup, Row, Col, Card } from 'react-bootstrap';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Barcode from 'react-barcode';
import BarcodeScanner from '../../components/BarcodeScanner';

export const AdminOrders = () => {
    const { orders } = useData();
    const { user } = useAuth();
    const isManager = user?.role === 'manager';
    const isExpediteur = user?.role === 'expediteur';
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusNote, setStatusNote] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [detailsOrder, setDetailsOrder] = useState(null);
    const [showScanner, setShowScanner] = useState(false);

    // Auto-open order on barcode scan / exact search
    const handleSearchChange = (val) => {
        setSearchTerm(val);
    };

    const handlePrintSlip = (order) => {
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        const barcodeSvg = document.getElementById(`barcode-svg-${order.id}`)?.outerHTML || '';

        printWindow.document.write(`
            <html>
                <head>
                    <title>Fiche Commande #${order.id}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 20px; text-align: center; }
                        .ticket { border: 1px dashed #000; padding: 15px; width: 80mm; margin: 0 auto; }
                        .header { font-weight: bold; font-size: 1.2rem; margin-bottom: 10px; }
                        .details { text-align: left; font-size: 0.9rem; margin: 15px 0; }
                        .barcode { margin: 20px 0; }
                        .footer { font-size: 0.7rem; color: #666; margin-top: 10px; }
                        @media print {
                            body { margin: 0; padding: 0; }
                            .ticket { border: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="ticket">
                        <div class="header">TRY MY DAY</div>
                        <div class="header">Commande #${order.id}</div>
                        <div class="barcode">
                            ${barcodeSvg}
                        </div>
                        <div class="details">
                            <strong>Client:</strong> ${order.customerName || order.customer}<br>
                            <strong>Tel:</strong> ${order.phone || 'N/A'}<br>
                            <strong>Date:</strong> ${order.date}<br>
                            <strong>Total:</strong> ${order.total.toLocaleString()} FCFA<br><br>
                            <strong>Articles:</strong><br>
                            ${order.items?.map(i => `- ${i.name} (x${i.quantity})`).join('<br>')}
                        </div>
                        <div class="footer">Merci de votre confiance !</div>
                    </div>
                    <script>
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Filter orders (last 30 days for manager/expediteur)
    const displayOrders = (isManager || isExpediteur) ? orders.filter(order => {
        try {
            const orderDate = new Date(order.date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            if (!isNaN(orderDate.getTime())) return orderDate >= thirtyDaysAgo;
            if (order.date.includes('/')) {
                const [d, m, y] = order.date.split('/');
                const parsedDate = new Date(`${y}-${m}-${d}`);
                return parsedDate >= thirtyDaysAgo;
            }
            return true;
        } catch (e) {
            return true;
        }
    }) : orders;

    // Filter orders with UI search/status
    const filteredOrders = displayOrders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.customer && order.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.email && order.email.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Statistics based on displayOrders (last 30 days if manager)
    const stats = {
        total: displayOrders.length,
        pending: displayOrders.filter(o => o.status === 'En attente').length,
        inProgress: displayOrders.filter(o => o.status === 'En cours de préparation').length,
        shipping: displayOrders.filter(o => o.status === 'En route').length,
        delivered: displayOrders.filter(o => o.status === 'Livrée' || o.status === 'Livré').length,
        cancelled: displayOrders.filter(o => o.status === 'Annulée').length,
        totalRevenue: displayOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0)
    };

    const handleStatusChange = (order, newStatus) => {
        setSelectedOrder(order);
        setShowModal(true);
        setStatusNote('');
        setTrackingNumber(order.trackingNumber || '');
    };

    const sendEmailNotification = async (order, newStatus, note) => {
        try {
            console.log('📧 Sending email notification for order:', order.id);
            const response = await fetch('http://localhost:3001/api/admin/order-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order: order,
                    status: newStatus,
                    note: note
                }),
            });

            const data = await response.json();
            if (data.success) {
                console.log('✅ Email notification sent successfully');
            } else {
                console.error('❌ Failed to send email notification:', data.message);
            }
        } catch (error) {
            console.error('❌ Error calling email API:', error);
        }
    };

    const saveStatusChange = async () => {
        if (!selectedOrder) return;

        const now = new Date();
        const timestamp = now.toLocaleString('fr-FR');
        const newStatus = document.getElementById('newStatus').value;

        // Create timeline entry
        const timelineEntry = {
            date: timestamp,
            oldStatus: selectedOrder.status,
            newStatus: newStatus,
            note: statusNote,
            admin: 'Trymyday'
        };

        // Update order
        const updatedOrders = orders.map(o => {
            if (o.id === selectedOrder.id) {
                return {
                    ...o,
                    status: newStatus,
                    trackingNumber: trackingNumber,
                    timeline: [...(o.timeline || []), timelineEntry],
                    lastUpdated: timestamp
                };
            }
            return o;
        });

        localStorage.setItem('orders', JSON.stringify(updatedOrders));

        // Send email notification to customer
        await sendEmailNotification(selectedOrder, newStatus, statusNote);

        setShowModal(false);
        window.location.reload();
    };

    const handleApproveCancellation = async (order) => {
        if (!window.confirm(`Approuver l'annulation de la commande #${order.id} et rembourser ${order.total.toLocaleString()} FCFA ?`)) return;

        // 1. Update order status
        const timestamp = new Date().toLocaleString('fr-FR');
        const timelineEntry = {
            date: timestamp,
            oldStatus: order.status,
            newStatus: "Annulée",
            note: "Annulation approuvée par l'admin. Client remboursé.",
            admin: 'Trymyday'
        };

        const updatedOrders = orders.map(o => {
            if (o.id === order.id) {
                return {
                    ...o,
                    status: 'Annulée',
                    timeline: [...(o.timeline || []), timelineEntry],
                    lastUpdated: timestamp
                };
            }
            return o;
        });
        localStorage.setItem('orders', JSON.stringify(updatedOrders));

        // 2. Process Real Refund via Backend
        try {
            console.log('💰 Triggering real refund for order:', order.id);
            const response = await fetch('http://localhost:3001/api/admin/order-refund', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order: order,
                    note: 'Annulation approuvée par Trymyday. Remboursement effectué.'
                }),
            });

            const data = await response.json();
            if (data.success) {
                console.log('✅ Refund processed successfully:', data.newBalance);
            } else {
                console.error('❌ Failed to process refund:', data.message);
                alert(`⚠️ Le statut de la commande a été mis à jour, mais le remboursement a échoué : ${data.message}`);
            }
        } catch (error) {
            console.error('❌ Error calling refund API:', error);
            alert('⚠️ Erreur lors de la communication avec le serveur pour le remboursement.');
        }

        alert(`✅ Commande #${order.id} annulée et remboursement effectué.`);
        window.location.reload();
    };

    const handleRefuseCancellation = async (order) => {
        if (!window.confirm(`Refuser la demande d'annulation pour la commande #${order.id} ?`)) return;

        const timestamp = new Date().toLocaleString('fr-FR');
        const timelineEntry = {
            date: timestamp,
            oldStatus: order.status,
            newStatus: "En cours de préparation",
            note: "Demande d'annulation refusée par Trymyday.",
            admin: 'Trymyday'
        };

        const updatedOrders = orders.map(o => {
            if (o.id === order.id) {
                return {
                    ...o,
                    status: 'En cours de préparation',
                    timeline: [...(o.timeline || []), timelineEntry],
                    lastUpdated: timestamp
                };
            }
            return o;
        });
        localStorage.setItem('orders', JSON.stringify(updatedOrders));

        // Send Email
        await sendEmailNotification(order, 'En cours de préparation', 'Demande d\'annulation refusée par Trymyday.');

        alert(`❌ Demande d'annulation refusée. Le statut est passé à "En cours de préparation".`);
        window.location.reload();
    };

    const exportToCSV = () => {
        const headers = ['ID Commande', 'ID Client', 'Nom', 'Téléphone', 'Date', 'Montant', 'Statut', 'Lien Suivi'];
        const rows = filteredOrders.map(o => [
            o.id,
            o.customerId || o.userId || '-',
            o.customerName || o.customer || 'Client',
            o.phone || '-',
            o.date,
            `${o.total.toLocaleString()} FCFA`,
            o.status,
            o.trackingNumber || '-'
        ]);

        // Utilisation de point-virgule pour Excel FR et encodage UTF-8 BOM
        const csvContent = "\uFEFF" + [
            headers.join(';'),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', `commandes_trymyday_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div>
            {/* Statistics Cards */}
            <Row className="mb-3 g-2">
                <Col>
                    <Card className="border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <Card.Body className="text-center p-2 text-white">
                            <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>Total</div>
                            <h6 className="mb-0 fw-bold">{stats.total}</h6>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <Card.Body className="text-center p-2 text-white">
                            <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>En attente</div>
                            <h6 className="mb-0 fw-bold">{stats.pending}</h6>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
                        <Card.Body className="text-center p-2 text-white">
                            <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>Préparation</div>
                            <h6 className="mb-0 fw-bold">{stats.inProgress}</h6>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
                        <Card.Body className="text-center p-2 text-white">
                            <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>En route</div>
                            <h6 className="mb-0 fw-bold">{stats.shipping}</h6>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        <Card.Body className="text-center p-2 text-white">
                            <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>Livrées</div>
                            <h6 className="mb-0 fw-bold">{stats.delivered}</h6>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                        <Card.Body className="text-center p-2 text-white">
                            <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>Annulées</div>
                            <h6 className="mb-0 fw-bold">{stats.cancelled}</h6>
                        </Card.Body>
                    </Card>
                </Col>
                {!isManager && !isExpediteur && (
                    <Col>
                        <Card className="border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                            <Card.Body className="text-center p-2 text-white">
                                <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>Revenu Total</div>
                                <h6 className="mb-0 fw-bold">{stats.totalRevenue.toLocaleString()} FCFA</h6>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>

            {/* Header */}
            <h5 className="mb-3 mt-3">Gestion des Commandes</h5>

            {/* Search and Filter */}
            <Row className="mb-4">
                <Col md={6}>
                    <InputGroup>
                        <InputGroup.Text>
                            <i className="bi bi-search"></i>
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Scanner le code-barre ou rechercher..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                        <Button
                            variant="outline-primary"
                            onClick={() => setShowScanner(true)}
                            title="Scanner le code-barre"
                        >
                            <i className="bi bi-camera"></i>
                        </Button>
                    </InputGroup>
                </Col>
                <Col md={3}>
                    <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">Tous les statuts</option>
                        <option value="En attente">En attente</option>
                        <option value="En cours de préparation">En préparation</option>
                        <option value="En route">En route</option>
                        <option value="Livrée">Livrée</option>
                        <option value="Annulée">Annulée</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Button variant="success" onClick={exportToCSV} className="w-100" size="sm">
                        <i className="bi bi-download me-1"></i>
                        Exporter
                    </Button>
                </Col>
            </Row>

            {/* Cancellation Requests Section */}
            {orders.filter(o => o.status === "Demande d'annulation").length > 0 && (
                <div className="mb-4">
                    <h6 className="text-danger fw-bold mb-3">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        Demandes d'annulation en attente
                    </h6>
                    <Row className="g-3">
                        {orders.filter(o => o.status === "Demande d'annulation").map(order => (
                            <Col key={order.id} md={6} lg={4}>
                                <Card className="border-danger shadow-sm h-100">
                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <div className="fw-bold">Commande #{order.id}</div>
                                                <small className="text-muted">{order.customerName || order.customer}</small>
                                            </div>
                                            <div className="fw-bold text-danger">{order.total.toLocaleString()} FCFA</div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                className="flex-grow-1"
                                                onClick={() => handleApproveCancellation(order)}
                                            >
                                                <i className="bi bi-check-circle me-1"></i> Approuver
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                className="flex-grow-1"
                                                onClick={() => handleRefuseCancellation(order)}
                                            >
                                                <i className="bi bi-x-circle me-1"></i> Refuser
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
                <div className="text-center text-muted py-5">
                    <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                    <p className="mt-3">Aucune commande trouvée</p>
                </div>
            ) : (
                <Table hover responsive>
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>ID Client</th>
                            <th>Téléphone</th>
                            <th>Date</th>
                            <th>Montant</th>
                            <th>Suivi</th>
                            <th>Statut</th>
                            <th>Imprimer</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.id}>
                                <td className="fw-mono">#{order.id}</td>
                                <td>{order.customerName || order.customer || 'Client'}</td>
                                <td className="small">{order.customerId || order.userId || '-'}</td>
                                <td className="small">{order.phone || '-'}</td>
                                <td className="small">{order.date}</td>
                                <td className="fw-bold text-success">{order.total.toLocaleString()} FCFA</td>
                                <td>
                                    {order.trackingNumber ? (
                                        <span className="badge bg-info">
                                            <i className="bi bi-truck me-1"></i>
                                            {order.trackingNumber}
                                        </span>
                                    ) : (
                                        <span className="text-muted small">-</span>
                                    )}
                                </td>
                                <td>
                                    <Badge bg={
                                        order.status === 'Livrée' || order.status === 'Livré' ? 'success' :
                                            order.status === 'En route' ? 'info' :
                                                order.status === 'En cours de préparation' ? 'warning' :
                                                    order.status === 'En attente' ? 'secondary' :
                                                        order.status === "Demande d'annulation" ? 'danger' :
                                                            order.status === 'Annulée' ? 'danger' : 'primary'
                                    }>
                                        {order.status}
                                    </Badge>
                                </td>
                                <td>
                                    <div style={{ display: 'none' }}>
                                        <Barcode id={`barcode-svg-${order.id}`} value={order.id} width={1} height={40} fontSize={12} />
                                    </div>
                                    <Button
                                        variant="outline-dark"
                                        size="sm"
                                        onClick={() => handlePrintSlip(order)}
                                        title="Imprimer la fiche"
                                    >
                                        <i className="bi bi-printer"></i>
                                    </Button>
                                </td>
                                <td>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleStatusChange(order)}
                                        className="me-1"
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => {
                                            setDetailsOrder(order);
                                            setShowDetailsModal(true);
                                        }}
                                    >
                                        <i className="bi bi-eye"></i>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Status Change Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Modifier le statut - Commande #{selectedOrder?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Statut actuel</Form.Label>
                            <Form.Control value={selectedOrder?.status || ''} disabled />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nouveau statut *</Form.Label>
                            <Form.Select id="newStatus" defaultValue={selectedOrder?.status}>
                                <option value="En attente">En attente</option>
                                <option value="En cours de préparation">En cours de préparation</option>
                                <option value="En route">En route</option>
                                <option value="Livrée">Livrée</option>
                                <option value="Annulée">Annulée</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Numéro de suivi</Form.Label>
                            <Form.Control
                                placeholder="Ex: DHL123456789"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                            />
                            <Form.Text className="text-muted">
                                Optionnel - Le client pourra suivre sa commande
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Note pour le client</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Ex: Votre colis est en cours de préparation..."
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                            />
                            <Form.Text className="text-muted">
                                Cette note sera visible par le client dans l'historique de sa commande
                            </Form.Text>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={saveStatusChange}>
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Order Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Détails Commande #{detailsOrder?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                    {detailsOrder && (
                        <div className="d-flex flex-column gap-4">
                            {/* Status and Summary Header */}
                            <div className="bg-light p-3 rounded-3 d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="text-muted small mb-1">Date de commande</div>
                                    <div className="fw-bold">{detailsOrder.date}</div>
                                </div>
                                <div className="text-end">
                                    <Badge bg={
                                        detailsOrder.status === 'Livrée' || detailsOrder.status === 'Livré' ? 'success' :
                                            detailsOrder.status === 'En route' ? 'info' :
                                                detailsOrder.status === 'En cours de préparation' ? 'warning' :
                                                    detailsOrder.status === 'En attente' ? 'secondary' : 'danger'
                                    } className="px-3 py-2 fs-6">
                                        {detailsOrder.status}
                                    </Badge>
                                    <div className="mt-1 fw-bold text-success fs-5">
                                        Total: {detailsOrder.total.toLocaleString()} FCFA
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div>
                                <h6 className="fw-bold border-bottom pb-2 mb-3">Informations Client</h6>
                                <Row className="g-3">
                                    <Col sm={6}>
                                        <div className="text-muted small">Nom :</div>
                                        <div className="fw-medium">{detailsOrder.customerName || detailsOrder.customer || 'N/A'}</div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="text-muted small">Téléphone :</div>
                                        <div className="fw-medium">{detailsOrder.phone || 'N/A'}</div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="text-muted small">Email :</div>
                                        <div className="fw-medium">{detailsOrder.email || 'N/A'}</div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="text-muted small">ID Client :</div>
                                        <div className="fw-medium">{(() => {
                                            // Chercher l'utilisateur à partir de l'email
                                            const users = JSON.parse(localStorage.getItem('users') || '[]');
                                            const orderUser = users.find(u => u.email === detailsOrder.email);
                                            return orderUser?.id || detailsOrder.customerId || detailsOrder.userId || 'N/A';
                                        })()}</div>
                                    </Col>
                                    <Col sm={12}>
                                        <div className="text-muted small">Adresse de livraison :</div>
                                        <div className="fw-medium bg-light p-2 rounded mt-1">
                                            {detailsOrder.shippingAddress ? (
                                                <>
                                                    {detailsOrder.shippingAddress.fullName && <>{detailsOrder.shippingAddress.fullName}<br /></>}
                                                    {detailsOrder.shippingAddress.address}<br />
                                                    {detailsOrder.shippingAddress.city}, {detailsOrder.shippingAddress.country} <br />
                                                    {detailsOrder.shippingAddress.postalCode && <>{detailsOrder.shippingAddress.postalCode}<br /></>}
                                                    {detailsOrder.shippingAddress.phone || detailsOrder.phone}
                                                </>
                                            ) : (
                                                <span className="text-muted fst-italic">Adresse non disponible</span>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            {/* Items List */}
                            <div>
                                <h6 className="fw-bold border-bottom pb-2 mb-3">Articles ({detailsOrder.items?.length || 0})</h6>
                                <div className="d-flex flex-column gap-3">
                                    {detailsOrder.items?.map((item, idx) => (
                                        <div key={idx} className="d-flex align-items-center border-bottom pb-3 last-border-0">
                                            <div className="bg-light rounded p-1 border me-3" style={{ width: '60px', height: '60px' }}>
                                                <img src={item.image} alt={item.name} className="w-100 h-100 object-fit-contain" />
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="fw-bold text-truncate" style={{ maxWidth: '300px' }}>{item.name}</div>
                                                <div className="text-muted small">
                                                    Prix u. : {parseFloat(item.price).toLocaleString()} FCFA
                                                    {item.size && <span className="ms-2 badge bg-light text-dark border">Taille: {item.size}</span>}
                                                    {item.color && (
                                                        <span className="ms-1 d-inline-block border rounded-circle"
                                                            style={{ width: '10px', height: '10px', backgroundColor: item.color }}
                                                            title={item.color}
                                                        ></span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold">x{item.quantity}</div>
                                                <div className="fw-bold text-primary">{(parseFloat(item.price) * item.quantity).toLocaleString()} FCFA</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="outline-dark" onClick={() => handlePrintSlip(detailsOrder)}>
                        <i className="bi bi-printer me-2"></i>Imprimer la fiche
                    </Button>
                    <Button variant="light" onClick={() => setShowDetailsModal(false)}>Fermer</Button>
                </Modal.Footer>
            </Modal>
            {/* Barcode Scanner Modal */}
            <BarcodeScanner
                show={showScanner}
                onHide={() => setShowScanner(false)}
                onScan={(code) => setSearchTerm(code)}
            />
        </div>
    );
};

export const AdminUsers = () => {
    const { users } = useData();
    return (
        <div>
            <h2 className="mb-4">Gestion des Clients</h2>
            <Table hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Inscrit le</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td className="fw-bold">{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <Badge bg={user.role === 'admin' ? 'danger' : 'info'}>
                                    {user.role}
                                </Badge>
                            </td>
                            <td>{user.joined}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};
export const AdminSupport = () => {
    const { helpQuestions, updateHelpQuestion, deleteHelpQuestion } = useData();
    const [selectedQ, setSelectedQ] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const [showAnswerModal, setShowAnswerModal] = useState(false);

    const handleAnswer = (q) => {
        setSelectedQ(q);
        setAnswerText(q.answer || '');
        setShowAnswerModal(true);
    };

    const saveAnswer = () => {
        if (!selectedQ) return;
        updateHelpQuestion(selectedQ.id, {
            answer: answerText,
            status: 'approved' // Auto-approve when answered
        });
        setShowAnswerModal(false);
    };

    const toggleStatus = (q) => {
        const newStatus = q.status === 'approved' ? 'pending' : 'approved';
        updateHelpQuestion(q.id, { status: newStatus });
    };

    const pendingCount = helpQuestions.filter(q => q.status === 'pending').length;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0 fw-bold">Support & Communauté</h2>
                {pendingCount > 0 && (
                    <Badge bg="danger" pill className="px-3 py-2">
                        {pendingCount} Question{pendingCount > 1 ? 's' : ''} en attente
                    </Badge>
                )}
            </div>

            <Table hover responsive className="align-middle">
                <thead className="table-light">
                    <tr>
                        <th>Date</th>
                        <th>Utilisateur</th>
                        <th>Question</th>
                        <th>Statut</th>
                        <th>Réponse</th>
                        <th className="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {helpQuestions.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="text-center py-5 text-muted">Aucune question pour le moment.</td>
                        </tr>
                    ) : (
                        helpQuestions.map(q => (
                            <tr key={q.id}>
                                <td className="small text-muted">{q.date}</td>
                                <td className="fw-bold">{q.userName}</td>
                                <td style={{ maxWidth: '300px' }}>
                                    <div className="text-truncate" title={q.question}>{q.question}</div>
                                </td>
                                <td>
                                    <Badge
                                        bg={q.status === 'approved' ? 'success' : 'warning'}
                                        className="cursor-pointer"
                                        onClick={() => toggleStatus(q)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {q.status === 'approved' ? 'Approuvée' : 'En attente'}
                                    </Badge>
                                </td>
                                <td style={{ maxWidth: '250px' }}>
                                    {q.answer ? (
                                        <div className="text-truncate small text-muted" title={q.answer}>{q.answer}</div>
                                    ) : (
                                        <span className="fst-italic text-danger small">Pas encore de réponse</span>
                                    )}
                                </td>
                                <td className="text-end">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleAnswer(q)}
                                    >
                                        <i className="bi bi-chat-left-dots me-1"></i> Répondre
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => { if (window.confirm('Supprimer cette question ?')) deleteHelpQuestion(q.id) }}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* Answer Modal */}
            <Modal show={showAnswerModal} onHide={() => setShowAnswerModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Répondre à la question</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                    <div className="mb-4">
                        <label className="text-muted small mb-1">Question de {selectedQ?.userName} :</label>
                        <div className="p-3 bg-light rounded-3 fw-medium">{selectedQ?.question}</div>
                    </div>
                    <Form.Group>
                        <label className="fw-bold mb-2">Votre Réponse</label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            placeholder="Écrivez votre réponse ici..."
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            className="rounded-3"
                        />
                        <Form.Text className="text-muted">
                            En enregistrant, la question sera automatiquement approuvée et visible par tous.
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setShowAnswerModal(false)}>Fermer</Button>
                    <Button variant="primary" onClick={saveAnswer} disabled={!answerText.trim()}>
                        Enregistrer et Approuver
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
