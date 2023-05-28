import '../App.css';

const Alert = (props) => {
    const { msg, visibility, onClose } = props;

    return (
        <div className={`alert alert-warning alert-dismissible fade ${visibility ? 'show' : ''}`} role="alert">
            {msg}
            <button onClick={onClose} type="button" className="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
        </div>
    );
}

export default Alert;