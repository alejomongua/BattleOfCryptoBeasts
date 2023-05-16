import "../App.css";
import Spinner from "./spinner";

const Login = ({
  onPressConnect,
  loading
}) => {
  return (
    <div className="login">
      { loading ? (
        <Spinner />
      ) : (
        <div className="loginConnect">
          Connect your wallet to log in
          <button onClick={onPressConnect} className="main-btn">
            Connect wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;