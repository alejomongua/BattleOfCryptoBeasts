import "../App.css";

const Login = ({
  onPressConnect,
  loading
}) => {
  return (
    <div className="login">
      { loading ? (
        <div className="loginConnect">
          Cargando...
        </div>
      ) : (
        <div className="loginConnect">
          Conecta tu billetera para ingresar
          <button onClick={onPressConnect} className="main-btn">
            Conectar billetera
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;