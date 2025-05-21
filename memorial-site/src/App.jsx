import { useState } from "react";
import "./App.css";
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import ProfileHeader from "./components/ProfileHeader";
import TabsNavigation from "./components/TabsNavigation";
import Historia from "./components/Historia";
import Contenido from "./components/Contenido";
import Comentarios from "./components/Comentarios";

function App() {
  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState('historia');

  // Renderizar el contenido de la pestaña seleccionada
  const renderTabContent = () => {
    switch (activeTab) {
      case 'historia':
        return <Historia />;
      case 'contenido':
        return <Contenido />;
      case 'comentarios':
        return <Comentarios />;
      default:
        return <Historia />;
    }
  };
  return <div>

    <NavBar/>
    <Banner/>
    <ProfileHeader/>
    <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
     {/* Contenido dinámico según la pestaña seleccionada */}
      <div className="flex-grow container mx-auto px-4 py-8">
        {renderTabContent()}
      </div>
    <Footer/>
  </div>;
}

export default App;
