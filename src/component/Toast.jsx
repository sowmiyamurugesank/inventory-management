import "../styles/Toast.css";
function Toast({ message }) {
    return (
        <div className="toast">
            {message}
        </div>
    );
}

export default Toast;