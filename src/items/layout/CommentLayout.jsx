import React from "react";
import { Outlet } from "react-router-dom";
import ItemHeader from "../components/common/ItemHeader";

const CommentLayout = () => {
  return (
    <>
      <ItemHeader />
      <Outlet />
    </>
  );
};

export default CommentLayout;