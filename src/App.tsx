import React from "react";
import ErrorBoundary from "./components/Error/ErrorBoundary";
import HomePage from "./pages/HomePage/HomePage";

const App: React.FC = () => {
  return (
    <div>
      <ErrorBoundary>
        <HomePage />
      </ErrorBoundary>
    </div>
  );
};

export default App;
