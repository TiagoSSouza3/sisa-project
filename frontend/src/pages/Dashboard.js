import React from "react";

export default function Dashboard() {
  const firstName = localStorage.getItem("name").split(" ")[0];

  return <h1>Bem-vindo ao sistema SISA, {firstName}</h1>;
}
