import { render, screen } from "@testing-library/react";
import Login from "./Login";

test("shows login button", () => {
  render(<Login />);
  const button = screen.getByText("Login");
  expect(button).toBeInTheDocument();
});