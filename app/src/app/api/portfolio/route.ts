import { NextResponse } from 'next/server'

export async function GET() {
  const portfolio = {
    name: "Harper Slone",
    title: "Visual Artist & Photographer",
    location: "Paris, France",
    availability: "Available worldwide",
    website: "https://www.harperslone.com",
    services: [
      "Image & Photography",
      "Video Production",
      "Brand Identity Design",
      "Book & Magazine Design",
      "Print & Poster Design",
      "Retail Graphics",
      "Brand Strategy",
      "Content Direction",
      "Type Design",
      "Product Design",
      "Creative Direction",
      "Styling",
    ],
    categories: [
      "Projects",
      "Work",
      "Exhibitions",
      "Print",
    ],
    contact: {
      page: "https://www.harperslone.com/contact",
    },
  }

  return NextResponse.json(portfolio)
}

