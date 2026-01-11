export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Productos Digitales
        </h1>
        <p className="text-lg text-muted-foreground">
          Descubre nuestra colección de productos digitales
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">
            Próximamente: productos disponibles
          </p>
        </div>
      </div>
    </div>
  );
}
