'use client';

import { useState, useEffect } from 'react';
import '../assets/style/styles.css'; // Importa el archivo CSS

// Define la estructura de un producto basado en el JSON
interface Product {
  [key: string]: string;
}

export default function HomePage() {
  // Estados de la aplicación
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [productHeaders, setProductHeaders] = useState<string[]>([]);

  console.log('Component Rendered. Current Query:', query, 'Selected:', selectedProducts.length, 'Related:', relatedProducts.length);

  // Cargar los datos del catálogo al iniciar
  useEffect(() => {
    console.log('Fetching data...');
    fetch('/data/catalog.json')
      .then(res => {
        if (!res.ok) {
          console.error('Failed to fetch data: ', res.status, res.statusText);
          return [];
        }
        return res.json();
      })
      .then((data: Product[]) => {
        console.log('Data fetched successfully:', data.length, 'items');
        if (data.length > 0) {
          setProducts(data);
          const headers = Object.keys(data[0]);
          console.log('Setting headers:', headers);
          setProductHeaders(headers);
        } else {
          console.warn('Fetched data is empty.');
        }
      })
      .catch(error => console.error('Error parsing or fetching data:', error));
  }, []);

  // Manejar cambios en el input de búsqueda
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    console.log(`Input changed: "${value}"`);

    if (value.length > 2) {
      const uniqueSuggestions = products.reduce((acc: Product[], current) => {
        if (current.Nom_Prod && current.Nom_Prod.toLowerCase().includes(value.toLowerCase())) {
          if (!acc.find(item => item.Nom_Prod === current.Nom_Prod)) {
            acc.push(current);
          }
        }
        return acc;
      }, []);
      console.log('Generated suggestions:', uniqueSuggestions);
      setSuggestions(uniqueSuggestions.slice(0, 10)); // Limitar a 10 sugerencias
    } else {
      setSuggestions([]);
    }
  };

  // Ejecutar la búsqueda
  const handleSearch = (searchQuery: string) => {
    console.log(`Handling search for: "${searchQuery}"`);
    if (!searchQuery) return;

    const foundProducts = products.filter(p => p.Nom_Prod && p.Nom_Prod.toLowerCase() === searchQuery.toLowerCase());
    setSelectedProducts(foundProducts);
    console.log('Found products:', foundProducts);
    setSuggestions([]);
    setQuery(searchQuery);

    if (foundProducts.length > 0) {
      const primaryIFA = foundProducts[0].Nom_IFA;
      console.log(`Primary IFA for related search: "${primaryIFA}"`);
      if (primaryIFA) {
        const related = products.filter(p =>
          p.Nom_IFA && p.Nom_IFA.toLowerCase() === primaryIFA.toLowerCase() 
          // &&p.Nom_Prod.toLowerCase() !== searchQuery.toLowerCase()
        );
        console.log('Found related products:', related);
        setRelatedProducts(related);
      } else {
        setRelatedProducts([]);
      }
    } else {
      setRelatedProducts([]);
    }
  };

  // Manejar clic en una sugerencia
  const handleSuggestionClick = (suggestion: Product) => {
    console.log('Suggestion clicked:', suggestion.Nom_Prod);
    handleSearch(suggestion.Nom_Prod);
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Buscador de Productos Farmacéuticos</h1>

      {/* Barra de Búsqueda */}
      <div className="search-container">
        <div className="flex">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Buscar por nombre de producto..."
            className="w-full p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSearch(query)}
            className="bg-blue-600 text-white px-6 py-3 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Buscar
          </button>
        </div>
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => handleSuggestionClick(s)}
                className="p-3 cursor-pointer hover:bg-gray-100"
              >
                {s.Nom_Prod}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tabla de Producto Seleccionado */}
      {selectedProducts.length > 0 && (

    <div id="tbuscar">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Información del Producto</h2>
          <div className="table-container">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {productHeaders.map(header => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedProducts.map((product, index) => (
                  <tr key={index}>
                    {productHeaders.map(header => (
                      <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product[header]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>

      )}

      {/* Tabla de Productos Relacionados por IFA */}
      {relatedProducts.length > 0 && (
        <div id="trecomendar">
          <h2 className="text-2xl font-semibold mb-4">Productos Relacionados (mismo IFA)</h2>
          <div className="table-container">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cod Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingrediente Activo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {relatedProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.Cod_Prod}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.Nom_Prod}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.Nom_IFA}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}