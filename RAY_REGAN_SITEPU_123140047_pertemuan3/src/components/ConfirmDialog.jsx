import { useEffect, useId, useRef } from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';

export default function ConfirmDialog({ title, children, onConfirm, onCancel }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    dialog.querySelector('button')?.focus();
    function onKey(event) {
      if (event.key === 'Escape') onCancel();
      if (event.key === 'Tab') {
        const buttons = [...dialog.querySelectorAll('button')];
        const first = buttons[0], last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); if (previous?.isConnected) previous.focus(); };
  }, [onCancel]);
  return <div className="dialog-backdrop"><section ref={dialogRef} className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}><span className="dialog-icon"><Icon name="trash" size={25}/></span><h2 id={titleId}>{title}</h2><div className="dialog-description">{children}</div><div className="dialog-actions"><button className="button secondary" onClick={onCancel}>Batal</button><button className="button danger" onClick={onConfirm}>Ya, hapus buku</button></div></section></div>;
}
ConfirmDialog.propTypes = { title: PropTypes.string.isRequired, children: PropTypes.node.isRequired, onConfirm: PropTypes.func.isRequired, onCancel: PropTypes.func.isRequired };
