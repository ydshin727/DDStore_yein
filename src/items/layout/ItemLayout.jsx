import React from "react";
import { Outlet } from "react-router-dom";
import ItemHeader from "../components/common/ItemHeader";
import ItemFooter from "../components/common/ItemFooter";
import '../css/common/itemLayout.css'

const ItemLayout = () => {
  return (
    <div className="layout">
      <ItemHeader />
      <main className="content">
        <Outlet />
      </main>
      <ItemFooter />
    </div>
  );
};

export default ItemLayout;