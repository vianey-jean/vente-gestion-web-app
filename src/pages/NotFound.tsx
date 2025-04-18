
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-12 bg-white shadow-lg rounded-lg">
        <div className="text-center">
          <div className="mx-auto bg-red-50 w-16 h-16 flex items-center justify-center rounded-full mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-2xl font-medium text-gray-700 mb-4">
            Page non trouvée
          </h2>
          <p className="text-gray-600 mb-8">
            La page "{location.pathname}" que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="space-y-3">
            <Link to="/">
              <Button className="w-full">Retourner à l'accueil</Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="w-full">
                Contacter le support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
