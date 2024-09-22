import React from 'react';

export function AlertModal({ show, onClose, type, message }) {
    if (!show) {
        return null;
    }

    return (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{type === 'success' ? 'Success' : 'Error'}</h5>
                        <button type="button" className="close" onClick={onClose} aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className={`alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
                            {type === 'success' ? '✓' : '✗'} {message}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AlertModal;
