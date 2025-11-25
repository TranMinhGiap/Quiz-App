import { useRoutes } from "react-router-dom";
import routes from "../../routes";

const AllRoutes = () => {
  const Routes = useRoutes(routes);
  return (
    <>
      {Routes}
    </>
  );
};

export default AllRoutes;