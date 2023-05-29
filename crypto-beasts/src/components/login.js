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
        <div>
          <div className="logo"><img src="/images/boc_logo.png" /></div>
          <div className="loginConnect">
            Connect your wallet to log in
            <button onClick={onPressConnect} className="main-btn">
              Connect wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;