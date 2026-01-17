import { Row, Col, Card } from 'react-bootstrap';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';

const AdminDashboard = () => {
    const { products, orders, users } = useData();
    const { user: authUser } = useAuth();
    const { balance } = useWallet();
    const { expenses } = useData();

    const isManager = authUser?.role === 'manager';
    const isExpediteur = authUser?.role === 'expediteur';

    // Filter orders (last 30 days for manager/expediteur)
    const displayOrders = (isManager || isExpediteur) ? (orders || []).filter(order => {
        try {
            if (!order || !order.date) return true;
            const orderDate = new Date(order.date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            if (!isNaN(orderDate.getTime())) {
                return orderDate >= thirtyDaysAgo;
            }
            // Fallback for formats like DD/MM/YYYY
            if (typeof order.date === 'string' && order.date.includes('/')) {
                const [d, m, y] = order.date.split('/');
                const parsedDate = new Date(`${y}-${m}-${d}`);
                return parsedDate >= thirtyDaysAgo;
            }
            return true;
        } catch (e) {
            return true;
        }
    }) : (orders || []);

    const totalRevenue = displayOrders.reduce((acc, o) => acc + (o.total || 0), 0);

    const totalExpenses = (expenses || []).reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const grossMargin = totalRevenue;
    const netProfit = grossMargin - totalExpenses;

    const stats = [
        !isExpediteur && { label: 'Total Produits', value: products.length, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { label: 'Commandes', value: displayOrders.filter(o => o.status !== 'Annulée').length, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
        isManager && { label: 'Mon Solde', value: (balance || 0).toLocaleString() + ' FCFA', gradient: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' },
        (!isManager && !isExpediteur) && { label: 'Clients', value: (users || []).length, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
        (!isManager && !isExpediteur) && { label: 'Chiffre d\'Affaires', value: totalRevenue.toLocaleString() + ' FCFA', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
        (!isManager && !isExpediteur) && { label: 'Marge Brute', value: grossMargin.toLocaleString() + ' FCFA', gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
        (!isManager && !isExpediteur) && { label: 'Charges Fixes', value: totalExpenses.toLocaleString() + ' FCFA', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        (!isManager && !isExpediteur) && { label: 'Bénéfice Net', value: netProfit.toLocaleString() + ' FCFA', gradient: netProfit >= 0 ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
    ].filter(Boolean);

    return (
        <div>
            <h2 className="mb-4">Vue d'ensemble</h2>
            <Row className="g-3">
                {stats.map((stat, idx) => (
                    <Col key={idx} md={3}>
                        <Card className="border-0 shadow-sm text-white" style={{ background: stat.gradient }}>
                            <Card.Body>
                                <h6 className="opacity-90">{stat.label}</h6>
                                <h3 className="fw-bold mb-0">{stat.value}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Cancellation Alerts */}
            {displayOrders.filter(o => o.status === "Demande d'annulation").length > 0 && (
                <Card className="border-0 shadow-sm mt-4 bg-danger text-white">
                    <Card.Body className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-1"><i className="bi bi-exclamation-octagon-fill me-2"></i>Demandes d'annulation</h5>
                            <p className="mb-0">Il y a {displayOrders.filter(o => o.status === "Demande d'annulation").length} demande(s) d'annulation en attente de votre confirmation.</p>
                        </div>
                        <a href="/admin/orders" className="btn btn-light btn-sm fw-bold">Voir et Gérer</a>
                    </Card.Body>
                </Card>
            )}

            {/* Active Orders Section */}
            <div className="mt-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">
                        <i className="bi bi-clock-history text-warning me-2"></i>
                        Commandes en cours
                    </h4>
                    <span className="badge bg-warning text-dark">
                        {displayOrders.filter(o => o.status !== 'Livrée' && o.status !== 'Livré' && o.status !== 'Annulée').length}
                    </span>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Client</th>
                                <th>ID Client</th>
                                <th>Téléphone</th>
                                <th>Date</th>
                                <th>Montant</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayOrders.filter(o => o.status !== 'Livrée' && o.status !== 'Livré' && o.status !== 'Annulée').slice(0, 5).length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-4">
                                        Aucune commande en cours
                                    </td>
                                </tr>
                            ) : (
                                displayOrders.filter(o => o.status !== 'Livrée' && o.status !== 'Livré' && o.status !== 'Annulée').slice(0, 5).map(order => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{order.customerName || order.customer || 'Client'}</td>
                                        <td className="small">{order.customerId || order.userId || '-'}</td>
                                        <td className="small">{order.phone || '-'}</td>
                                        <td className="small">{order.date}</td>
                                        <td className="fw-bold text-success">{order.total.toLocaleString()} FCFA</td>
                                        <td>
                                            <span className={`badge bg-${order.status === 'En expédition' ? 'info' :
                                                order.status === 'En cours' ? 'warning' :
                                                    order.status === 'En attente' ? 'secondary' :
                                                        order.status === "Demande d'annulation" ? 'danger animate-pulse' :
                                                            order.status === 'Annulée' ? 'danger' : 'primary'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delivered Orders Section */}
            <div className="mt-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        Commandes livrées
                    </h4>
                    <span className="badge bg-success">
                        {displayOrders.filter(o => o.status === 'Livrée' || o.status === 'Livré').length}
                    </span>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Client</th>
                                <th>ID Client</th>
                                <th>Téléphone</th>
                                <th>Date</th>
                                <th>Montant</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody className="table-success table-success-subtle">
                            {displayOrders.filter(o => o.status === 'Livrée' || o.status === 'Livré').slice(0, 5).length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-4">
                                        Aucune commande livrée
                                    </td>
                                </tr>
                            ) : (
                                displayOrders.filter(o => o.status === 'Livrée' || o.status === 'Livré').slice(0, 5).map(order => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{order.customerName || order.customer || 'Client'}</td>
                                        <td className="small">{order.customerId || order.userId || '-'}</td>
                                        <td className="small">{order.phone || '-'}</td>
                                        <td className="small">{order.date}</td>
                                        <td className="fw-bold text-success">{order.total.toLocaleString()} FCFA</td>
                                        <td>
                                            <span className="badge bg-success">
                                                Livrée
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
