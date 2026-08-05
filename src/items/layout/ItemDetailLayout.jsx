import React from "react";
import { Outlet } from "react-router-dom";
import ItemHeader from "../components/common/ItemHeader";

const ItemDetailLayout = () => {
  return (
    <>
      <ItemHeader />
      <Outlet />
    </>
  );
};

export default ItemDetailLayout;