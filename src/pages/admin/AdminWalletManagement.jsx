import { Container, Row, Col, Card, Form, Button, Table, Badge, Alert, Modal } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config';

const AdminWalletManagement = () => {
    const { user: authUser } = useAuth();
    const navigate = useNavigate();

    if (authUser?.role === 'expediteur') {
        navigate('/admin');
        return null;
    }

    const { balance: managerBalance, fetchBalance: refreshManagerBalance } = useWallet();
    const isManager = authUser?.role === 'manager';

    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [txSearchTerm, setTxSearchTerm] = useState('');
    const [timeFilter, setTimeFilter] = useState('month'); // month, 3months, 6months, year, all
    const [showVirementModal, setShowVirementModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [virementAmount, setVirementAmount] = useState('');
    const [virementDescription, setVirementDescription] = useState('');
    const [message, setMessage] = useState(null);
    const [isIdVirement, setIsIdVirement] = useState(false);
    const [directUserId, setDirectUserId] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null); // New state for details modal
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch data from localStorage
    const fetchData = () => {
        setLoading(true);
        try {
            // Load users
            const localUsers = JSON.parse(localStorage.getItem('users')) || [];
            const safeUsers = Array.isArray(localUsers) ? localUsers.filter(u => u && typeof u === 'object') : [];
            setUsers(safeUsers);

            // Load transactions
            const localTransactions = JSON.parse(localStorage.getItem('wallet_transactions')) || [];
            const safeTransactions = Array.isArray(localTransactions) ? localTransactions.filter(t => t && typeof t === 'object') : [];
            // Sort by date descending
            const sortedTransactions = safeTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTransactions(sortedTransactions);
        } catch (error) {
            console.error('Error fetching localStorage data:', error);
            setMessage({ type: 'danger', text: 'Erreur lors du chargement des données locales' });
        } finally {
            setLoading(false);
        }
    };

    // Virement user wallet
    const handleVirementWallet = async () => {
        const targetUser = isIdVirement ? foundUser : selectedUser;
        if (!targetUser || !virementAmount || parseFloat(virementAmount) <= 0) {
            setMessage({ type: 'danger', text: 'Veuillez remplir tous les champs correctement' });
            return;
        }

        if (!window.confirm(`Êtes-vous sûr de vouloir effectuer un virement de ${parseFloat(virementAmount).toLocaleString()} FCFA à ${targetUser.name} (${targetUser.id}) ?`)) {
            return;
        }

        setIsProcessing(true);
        try {
            const amount = parseFloat(virementAmount);
            const targetEmail = isIdVirement ? (foundUser?.email) : selectedUser?.email;

            if (isManager && targetEmail === authUser.email) {
                setMessage({ type: 'danger', text: 'Vous ne pouvez pas vous envoyer des fonds à vous-même' });
                setIsProcessing(false);
                return;
            }

            // 1. Appel API Backend
            let response;
            if (isManager) {
                response = await fetch(`${API_BASE_URL}/api/wallet/transfer`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fromEmail: authUser.email,
                        toEmail: targetEmail,
                        amount: amount,
                        description: virementDescription || 'Virement Manager'
                    }),
                });
            } else {
                response = await fetch(`${API_BASE_URL}/api/admin/wallet/credit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: targetEmail,
                        userId: isIdVirement ? directUserId : selectedUser?.id,
                        amount: amount,
                        description: virementDescription || 'Virement TRYMYDAY'
                    }),
                });
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message);
            }

            // Sync with current data logic
            const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const userToCredit = isIdVirement ? foundUser : selectedUser;
            const userIndex = localUsers.findIndex(u => u.id === userToCredit.id);

            if (userIndex !== -1) {
                const oldBalance = localUsers[userIndex].balance || 0;
                localUsers[userIndex].balance = oldBalance + amount;
                if (isManager) {
                    const managerIdx = localUsers.findIndex(u => u.email === authUser.email);
                    if (managerIdx !== -1) localUsers[managerIdx].balance -= amount;
                }
                localStorage.setItem('users', JSON.stringify(localUsers));

                const localTransactions = JSON.parse(localStorage.getItem('wallet_transactions') || '[]');
                localTransactions.push({
                    id: Date.now(),
                    userId: localUsers[userIndex].id,
                    userEmail: localUsers[userIndex].email,
                    amount: amount,
                    type: 'credit',
                    description: virementDescription || (isManager ? 'Virement Manager' : 'Virement TRYMYDAY'),
                    date: new Date().toISOString(),
                    balanceAfter: localUsers[userIndex].balance
                });
                localStorage.setItem('wallet_transactions', JSON.stringify(localTransactions));
            }

            if (isManager) refreshManagerBalance();

            setMessage({ type: 'success', text: `Virement de ${amount.toLocaleString()} FCFA effectué avec succès !` });
            handleCloseModal();
            fetchData();
        } catch (error) {
            setMessage({ type: 'danger', text: 'Erreur lors de la mise à jour du solde : ' + error.message });
            handleCloseModal();
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Undo a transaction
    const handleUndoTransaction = (transactionId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir annuler cette transaction ? Le montant sera déduit du solde de l'utilisateur.")) {
            return;
        }

        try {
            const localTransactions = JSON.parse(localStorage.getItem('wallet_transactions') || '[]');
            const txIndex = localTransactions.findIndex(tx => tx.id === transactionId);

            if (txIndex === -1) {
                setMessage({ type: 'danger', text: 'Transaction introuvable' });
                return;
            }

            const tx = localTransactions[txIndex];

            // Revert balance for the user
            const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = localUsers.findIndex(u => u.id === tx.userId);

            if (userIndex !== -1) {
                localUsers[userIndex].balance = (localUsers[userIndex].balance || 0) - tx.amount;
                localStorage.setItem('users', JSON.stringify(localUsers));
            }

            // Mark as cancelled instead of deleting
            localTransactions[txIndex] = {
                ...tx,
                status: 'cancelled',
                description: tx.description + ' (Annulée par l\'admin)',
                cancelledAt: new Date().toISOString()
            };
            localStorage.setItem('wallet_transactions', JSON.stringify(localTransactions));

            setMessage({ type: 'success', text: 'Transaction marquée comme annulée' });
            fetchData();
        } catch (error) {
            setMessage({ type: 'danger', text: 'Erreur lors de l\'annulation' });
            console.error(error);
        }
    };

    // Filter users based on search
    // Handle direct ID search (Modified to search by Phone or ID)
    useEffect(() => {
        if (isIdVirement && directUserId) {
            const user = users.find(u =>
                (u.phone && String(u.phone).includes(directUserId)) ||
                (u.id && String(u.id).toLowerCase() === directUserId.toLowerCase())
            );
            setFoundUser(user || null);
        } else {
            setFoundUser(null);
        }
    }, [directUserId, isIdVirement, users]);

    // Handle modal close
    const handleCloseModal = () => {
        setShowVirementModal(false);
        setIsIdVirement(false);
        setDirectUserId('');
        setFoundUser(null);
        setVirementAmount('');
        setVirementDescription('');
        setSelectedUser(null);
        setIsProcessing(false);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.id && String(user.id).toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.name && String(user.name).toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.phone && String(user.phone).includes(searchTerm)); // Include phone in global search

        if (isManager && user.email === authUser.email) return false;
        return matchesSearch;
    });



    // Filter transactions based on search and manager restrictions
    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch =
            (tx.userEmail && String(tx.userEmail).toLowerCase().includes(txSearchTerm.toLowerCase())) ||
            (tx.userId && String(tx.userId).toLowerCase().includes(txSearchTerm.toLowerCase())) || // Added userId search
            (tx.description && String(tx.description).toLowerCase().includes(txSearchTerm.toLowerCase())) ||
            (tx.amount !== undefined && tx.amount !== null && String(tx.amount).includes(txSearchTerm)) ||
            (tx.type && String(tx.type).toLowerCase().includes(txSearchTerm.toLowerCase()));

        // Restriction pour les managers : 30 derniers jours (déjà appliqué par timeFilter ci-dessous si défaut, mais on garde la logique métier si nécessaire)
        // Ici on applique le filtre de temps sélectionné par l'admin
        let matchesDate = true;
        if (timeFilter !== 'all') {
            const dateLimit = new Date();
            if (timeFilter === 'month') dateLimit.setMonth(dateLimit.getMonth() - 1);
            if (timeFilter === '3months') dateLimit.setMonth(dateLimit.getMonth() - 3);
            if (timeFilter === '6months') dateLimit.setMonth(dateLimit.getMonth() - 6);
            if (timeFilter === 'year') dateLimit.setFullYear(dateLimit.getFullYear() - 1);

            matchesDate = new Date(tx.date || Date.now()) >= dateLimit;
        }

        return matchesSearch && matchesDate;
    });

    // Export transactions to CSV
    const exportTransactionsCSV = () => {
        if (transactions.length === 0) {
            setMessage({ type: 'warning', text: 'Aucune transaction à exporter' });
            return;
        }

        const headers = ['Date', 'Type', 'ID', 'Nom', 'Téléphone', 'Montant', 'Description', 'Solde Après'];
        const rows = filteredTransactions.map(tx => {
            const user = users.find(u => u.id === tx.userId || u.email === tx.userEmail);
            return [
                new Date(tx.date || Date.now()).toLocaleDateString('fr-FR'),
                tx.type === 'credit' ? 'Virement' : 'Débit',
                user?.id || tx.userId || '-',
                user?.name || '-',
                user?.phone || '-',
                `${(tx.amount || 0).toLocaleString()} FCFA`,
                tx.description || '',
                `${(tx.balanceAfter || 0).toLocaleString()} FCFA`
            ];
        });

        const csvContent = "\uFEFF" + [
            headers.join(';'),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', `transactions_trymyday_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Container fluid className="pb-4 pt-0">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h3 className="fw-bold mb-0">
                        <i className="bi bi-wallet2 me-2 text-warning"></i>
                        Gestion des Portefeuilles
                    </h3>
                    {isManager && (
                        <p className="text-muted small mb-0 mt-1 d-none d-md-block">
                            Gérez les soldes clients en utilisant votre solde de manager.
                        </p>
                    )}
                </div>

                <div className="d-flex align-items-center gap-3">
                    {isManager && (
                        <div className="d-flex align-items-center bg-white border border-info-subtle shadow-sm px-3 py-2 rounded-3">
                            <div className="me-3">
                                <div className="text-muted" style={{ fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SOLDE MANAGER</div>
                                <div className="fw-bold text-dark fs-5">{managerBalance.toLocaleString()} FCFA</div>
                            </div>
                            <div className="bg-info-subtle p-2 rounded-circle text-info">
                                <i className="bi bi-wallet2"></i>
                            </div>
                        </div>
                    )}

                    <Badge bg="dark" className="px-3 py-2 fs-6 shadow-sm" style={{ borderRadius: '8px' }}>
                        {users.length} Clients
                    </Badge>
                </div>
            </div>

            {message && (
                <Alert variant={message.type} className="border-0 shadow-sm animate__animated animate__fadeIn mb-4" dismissible onClose={() => setMessage(null)}>
                    <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
                    {message.text}
                </Alert>
            )}

            <Row className="mb-4">
                <Col xs={12}>
                    <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded-3 shadow-sm border">
                        <div className="d-flex align-items-center gap-3">
                            <h5 className="mb-0 fw-bold text-muted">Actions Rapides</h5>
                            <Button
                                variant="warning"
                                className="text-white fw-bold px-4"
                                style={{ borderRadius: '8px' }}
                                onClick={() => {
                                    setIsIdVirement(true);
                                    setShowVirementModal(true);
                                }}
                            >
                                <i className="bi bi-person-badge me-2"></i>
                                Virement par ID
                            </Button>
                        </div>
                        <div className="d-flex gap-2">
                            <Form.Select
                                value={timeFilter}
                                onChange={(e) => setTimeFilter(e.target.value)}
                                style={{ borderRadius: '8px', cursor: 'pointer', border: '1px solid #dee2e6', width: 'auto' }}
                                className="bg-white text-muted fw-bold shadow-sm"
                            >
                                <option value="month">Ce mois</option>
                                <option value="3months">3 mois</option>
                                <option value="6months">6 mois</option>
                                <option value="year">Cette année</option>
                                <option value="all">Tout l'historique</option>
                            </Form.Select>
                            <div className="position-relative" style={{ minWidth: '300px' }}>
                                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                                <Form.Control
                                    type="text"
                                    placeholder="Rechercher transaction (ID, Nom, Montant)..."
                                    className="ps-5 border bg-light"
                                    style={{ borderRadius: '8px' }}
                                    value={txSearchTerm}
                                    onChange={(e) => setTxSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="outline-success"
                                onClick={exportTransactionsCSV}
                                style={{ borderRadius: '8px' }}
                            >
                                <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                                CSV
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row className="g-4">
                {/* Full Width Transactions History */}
                <Col xs={12}>
                    <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
                        <Card.Header className="bg-white p-3 border-bottom-0">
                            <h5 className="mb-0 fw-bold">Historique des Transactions</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <Table hover className="align-middle mb-0">
                                    <thead className="bg-light text-muted small text-uppercase">
                                        <tr>
                                            <th className="ps-4">Date</th>
                                            <th>Utilisateur</th>
                                            <th>Type</th>
                                            <th>Description</th>
                                            <th>Montant</th>
                                            <th>Solde Après</th>
                                            <th className="text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.length > 0 ? (
                                            filteredTransactions.map((tx) => {
                                                const u = users.find(usr => usr.email === tx.userEmail || usr.id === tx.userId);
                                                return (
                                                    <tr key={tx.id}>
                                                        <td className="ps-4 text-nowrap text-muted small">
                                                            {new Date(tx.date).toLocaleDateString('fr-FR', {
                                                                day: '2-digit', month: 'short', year: 'numeric',
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2 text-muted border" style={{ width: '32px', height: '32px' }}>
                                                                    {u?.avatar || '👤'}
                                                                </div>
                                                                <div>
                                                                    <div className="fw-bold text-dark small">{u?.name || 'Inconnu'}</div>
                                                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>ID: {u?.id || tx.userId}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Badge bg={tx.status === 'cancelled' ? 'secondary' : (tx.type === 'credit' ? 'success' : 'danger')} className="px-2" style={{ borderRadius: '5px' }}>
                                                                {tx.status === 'cancelled' ? 'ANNULÉE' : (
                                                                    tx.description?.toLowerCase().includes('remboursement') ? 'REMBOURSEMENT' :
                                                                        tx.type === 'credit' ? 'VIREMENT' : 'ACHAT'
                                                                )}
                                                            </Badge>
                                                        </td>
                                                        <td className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                                                            {tx.description}
                                                        </td>
                                                        <td className={`fw-bold ${tx.status === 'cancelled' ? 'text-decoration-line-through text-muted' : (tx.type === 'credit' ? 'text-success' : 'text-danger')}`}>
                                                            {tx.type === 'credit' ? '+' : '-'}{(tx.amount || 0).toLocaleString()} FCFA
                                                        </td>
                                                        <td className="fw-bold text-dark">
                                                            {(tx.balanceAfter || 0).toLocaleString()} FCFA
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            <div className="d-flex align-items-center justify-content-end gap-2">
                                                                <Button
                                                                    variant="light"
                                                                    size="sm"
                                                                    className="btn-sm-square border"
                                                                    title="Voir l'historique de ce client"
                                                                    onClick={() => setTxSearchTerm(u?.id || tx.userId)}
                                                                >
                                                                    <i className="bi bi-clock-history text-primary"></i>
                                                                </Button>
                                                                {tx.type === 'credit' && tx.status !== 'cancelled' && (
                                                                    <Button
                                                                        variant="light"
                                                                        size="sm"
                                                                        className="btn-sm-square border"
                                                                        onClick={() => handleUndoTransaction(tx.id)}
                                                                        title="Annuler cette transaction"
                                                                    >
                                                                        <i className="bi bi-x-lg text-danger"></i>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center p-5 text-muted">
                                                    <i className="bi bi-search fs-1 d-block mb-3 opacity-25"></i>
                                                    Aucune transaction trouvée pour "{txSearchTerm}"
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Virement Modal */}
            <Modal show={showVirementModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Faire un Virement</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-3">
                    {(selectedUser || isIdVirement) && (
                        <>
                            {isIdVirement && !foundUser && (
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-muted">ID DU CLIENT</Form.Label>
                                    <div className="position-relative">
                                        <i className="bi bi-person-badge position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ex: 84930215"
                                            className="ps-5 py-2 border-0 bg-light fw-bold"
                                            style={{ borderRadius: '10px' }}
                                            value={directUserId}
                                            onChange={(e) => setDirectUserId(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    {directUserId && !foundUser && (
                                        <small className="text-danger mt-1 d-block animate__animated animate__shakeX">
                                            Aucun client trouvé avec cet ID
                                        </small>
                                    )}
                                </Form.Group>
                            )}

                            {(selectedUser || foundUser) && (
                                <div className="bg-light p-3 rounded-4 mb-4 d-flex align-items-center">
                                    <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '45px', height: '45px', fontSize: '1.5rem' }}>
                                        {(isIdVirement ? foundUser.avatar : selectedUser.avatar) || '👤'}
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="fw-bold mb-0">{(isIdVirement ? foundUser.name : selectedUser.name)}</h6>
                                            <Badge bg="warning" text="dark" className="small">ID: {(isIdVirement ? foundUser.id : selectedUser.id)}</Badge>
                                        </div>
                                        <div className="mt-1">
                                            <small className="fw-bold text-dark">Solde actuel: {((isIdVirement ? foundUser.balance : selectedUser.balance) || 0).toLocaleString()} FCFA</small>
                                        </div>
                                    </div>
                                    {isIdVirement && (
                                        <Button variant="link" className="text-muted p-0 ms-2" onClick={() => setDirectUserId('')}>
                                            <i className="bi bi-pencil-square"></i>
                                        </Button>
                                    )}
                                </div>
                            )}

                            {(selectedUser || foundUser) && (
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">MONTANT DU VIREMENT (FCFA)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0.00"
                                            className="py-2 border-0 bg-light fw-bold"
                                            style={{ borderRadius: '10px', fontSize: '1.2rem' }}
                                            value={virementAmount}
                                            onChange={(e) => setVirementAmount(e.target.value)}
                                            min="0"
                                            step="0.01"
                                            autoFocus={!isIdVirement}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-0">
                                        <Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ex: Récompense fidélité"
                                            className="py-2 border-0 bg-light"
                                            style={{ borderRadius: '10px' }}
                                            value={virementDescription}
                                            onChange={(e) => setVirementDescription(e.target.value)}
                                        />
                                    </Form.Group>
                                </Form>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" className="fw-bold" onClick={handleCloseModal} style={{ borderRadius: '10px' }} disabled={isProcessing}>
                        Annuler
                    </Button>
                    {(selectedUser || foundUser) && (
                        <Button
                            variant="warning"
                            className="text-white fw-bold px-4"
                            onClick={handleVirementWallet}
                            style={{ borderRadius: '10px' }}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Traitement...
                                </>
                            ) : 'Confirmer le virement'}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Transaction Details Modal */}
            <Modal show={!!selectedTransaction} onHide={() => setSelectedTransaction(null)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Détails de la Transaction</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedTransaction && (() => {
                        const u = users.find(usr => usr.email === selectedTransaction.userEmail || usr.id === selectedTransaction.userId);
                        return (
                            <div className="d-flex flex-column gap-3">
                                <div className="text-center mb-3">
                                    <div className={`display-4 fw-bold ${selectedTransaction.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                                        {selectedTransaction.type === 'credit' ? '+' : '-'}{(selectedTransaction.amount || 0).toLocaleString()} FCFA
                                    </div>
                                    <Badge bg={selectedTransaction.status === 'cancelled' ? 'secondary' : (selectedTransaction.type === 'credit' ? 'success' : 'danger')} className="px-3 py-2 fs-6 rounded-pill mt-2">
                                        {selectedTransaction.status === 'cancelled' ? 'ANNULÉE' : (
                                            selectedTransaction.description?.toLowerCase().includes('remboursement') ? 'REMBOURSEMENT' :
                                                selectedTransaction.type === 'credit' ? 'VIREMENT' : 'ACHAT'
                                        )}
                                    </Badge>
                                </div>

                                <div className="bg-light p-3 rounded-3">
                                    <h6 className="fw-bold text-muted small text-uppercase mb-3">Informations Client</h6>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-white rounded-circle d-flex align-items-center justify-content-center me-3 border shadow-sm" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>
                                            {u?.avatar || '👤'}
                                        </div>
                                        <div>
                                            <div className="fw-bold fs-5">{u?.name || 'Inconnu'}</div>
                                            <div className="text-muted small">ID: {u?.id || selectedTransaction.userId}</div>
                                            <div className="text-muted small">{u?.email || selectedTransaction.userEmail}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border rounded-3 p-3">
                                    <h6 className="fw-bold text-muted small text-uppercase mb-3">Détails</h6>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Date</span>
                                        <span className="fw-medium">
                                            {new Date(selectedTransaction.date).toLocaleDateString('fr-FR', {
                                                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Description</span>
                                        <span className="fw-medium text-end" style={{ maxWidth: '60%' }}>{selectedTransaction.description}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Solde après tx</span>
                                        <span className="fw-bold text-dark">{(selectedTransaction.balanceAfter || 0).toLocaleString()} FCFA</span>
                                    </div>
                                </div>

                                {selectedTransaction.status === 'cancelled' && (
                                    <Alert variant="secondary" className="mb-0 small">
                                        <i className="bi bi-info-circle me-2"></i>
                                        Cette transaction a été annulée le {new Date(selectedTransaction.cancelledAt).toLocaleDateString('fr-FR')}.
                                    </Alert>
                                )}
                            </div>
                        );
                    })()}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setSelectedTransaction(null)}>Fermer</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminWalletManagement;
