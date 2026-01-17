import React, { useEffect, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Html5QrcodeScanner } from 'html5-qrcode';

const BarcodeScanner = ({ show, onHide, onScan }) => {
    const scannerRef = useRef(null);

    useEffect(() => {
        let scanner = null;

        if (show) {
            // Delay initialization to ensure the DOM element is rendered
            const timeoutId = setTimeout(() => {
                scanner = new Html5QrcodeScanner(
                    "reader",
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    /* verbose= */ false
                );

                scanner.render(
                    (decodedText) => {
                        onScan(decodedText);
                        onHide(); // Close modal on success
                        if (scanner) {
                            scanner.clear().catch(error => {
                                console.error("Failed to clear scanner:", error);
                            });
                        }
                    },
                    (error) => {
                        // Scan errors are common (e.g. no barcode found in frame), so we don't spam the console
                        // console.warn(`Scan error: ${error}`);
                    }
                );
            }, 500);

            return () => {
                clearTimeout(timeoutId);
                if (scanner) {
                    scanner.clear().catch(error => {
                        console.error("Failed to clear scanner on unmount:", error);
                    });
                }
            };
        }
    }, [show, onScan, onHide]);

    return (
        <Modal show={show} onHide={onHide} centered size="md">
            <Modal.Header closeButton>
                <Modal.Title>Scanner un Code-Barre</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div id="reader" style={{ width: '100%' }}></div>
                <div className="mt-3 text-center text-muted small">
                    <i className="bi bi-camera me-2"></i>
                    Placez le code-barre devant la caméra
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Fermer
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BarcodeScanner;
