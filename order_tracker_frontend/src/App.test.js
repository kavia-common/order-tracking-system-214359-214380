import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders dashboard", () => {
  render(<App />);
  const title = screen.getByText(/dashboard/i);
  expect(title).toBeInTheDocument();
});
