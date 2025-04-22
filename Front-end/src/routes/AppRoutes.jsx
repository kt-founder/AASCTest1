import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ContactManager from "../components/ContactManager";
// import ContactDetail from "./components/ContactDetail"; // nếu có
// import AboutPage from "./pages/AboutPage"; // nếu có

const router = createBrowserRouter([
  {
    path: "/",
    element: <ContactManager />,
  },
  // {
  //   path: "/contacts/:id",
  //   element: <ContactDetail />,
  // },
  // {
  //   path: "/about",
  //   element: <AboutPage />,
  // },
  // {
  //   path: "*",
  //   element: <div className="p-4 text-red-500">404 - Không tìm thấy trang</div>,
  // },
]);

const AppRoutes = () => <RouterProvider router={router} />;

export default AppRoutes;
