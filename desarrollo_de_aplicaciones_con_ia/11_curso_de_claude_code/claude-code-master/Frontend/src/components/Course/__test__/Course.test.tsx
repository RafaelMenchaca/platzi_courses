import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Course } from "../Course";

describe("Course Component", () => {
  const mockCourse = {
    id: 1,
    name: "React Fundamentals",
    description: "Aprende React desde cero",
    thumbnail: "https://example.com/thumbnail.jpg",
    average_rating: 4.5,
    total_ratings: 42,
  };

  it("renders course information correctly", () => {
    render(<Course {...mockCourse} />);

    // El nombre del curso se renderiza
    expect(screen.getByText(mockCourse.name)).toBeInTheDocument();

    // La descripción se renderiza
    expect(screen.getByText(mockCourse.description)).toBeInTheDocument();
  });

  it("renders thumbnail with correct alt text", () => {
    render(<Course {...mockCourse} />);

    // getByAltText apunta al <img> (evita ambigüedad con el role="img" de StarRating)
    const thumbnail = screen.getByAltText(mockCourse.name);
    expect(thumbnail).toHaveAttribute("src", mockCourse.thumbnail);
  });

  it("renders the average rating with its count", () => {
    render(<Course {...mockCourse} />);

    // StarRating en modo display expone role="img" con aria-label del rating
    const stars = screen.getByLabelText(/Rating: 4.5 out of 5 stars/);
    expect(stars).toBeInTheDocument();
    expect(screen.getByText(`(${mockCourse.total_ratings})`)).toBeInTheDocument();
  });

  it("does not render rating section when average_rating is absent", () => {
    const { average_rating, total_ratings, ...withoutRating } = mockCourse;
    render(<Course {...withoutRating} />);

    expect(screen.queryByLabelText(/Rating:/)).not.toBeInTheDocument();
  });

  it("renders with correct structure", () => {
    const { container } = render(<Course {...mockCourse} />);

    expect(container.querySelector("article")).toBeInTheDocument();
    expect(container.querySelector("div > img")).toBeInTheDocument();
    expect(container.querySelector("h2")).toBeInTheDocument();
  });
});
