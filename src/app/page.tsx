import api from "~/product/api";
import StoreScreen from "~/store/screens/Store";

function IndexRoute() {
  const products = await api.list();

  return <StoreScreen products={products} />;
}

export default IndexRoute;
