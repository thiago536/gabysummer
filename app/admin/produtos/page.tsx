"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Plus, Search, Edit, Trash2, Copy, Download, Loader2 } from "lucide-react"

const categories = ["Moda Praia", "Fitness", "Acessórios"]
const colors = [
  { name: "Laranja Sunset", value: "#FF5722" },
  { name: "Amarelo Solar", value: "#FFD600" },
  { name: "Azul Oceano", value: "#03A9F4" },
  { name: "Rosa Coral", value: "#FF7043" },
  { name: "Verde Tropical", value: "#4CAF50" },
  { name: "Branco Areia", value: "#FAFAFA" },
  { name: "Preto Elegante", value: "#212121" },
]
const sizes = ["PP", "P", "M", "G", "GG", "Único"]

export default function AdminProducts() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Todos")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    selectedColors: [],
    selectedSizes: [],
    ativo: true,
  })

  useEffect(() => {
    const isAuth = localStorage.getItem("gabyAdminAuth")
    if (!isAuth) {
      router.push("/admin")
      return
    }
    setIsAuthenticated(true)
    loadProducts()
  }, [router])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/produtos")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setProducts(data || [])
      setFilteredProducts(data || [])
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      alert("Erro ao carregar produtos")
    } finally {
      setLoading(false)
    }
  }

  // Filter products
  const handleSearch = (term) => {
    setSearchTerm(term)
    filterProducts(term, categoryFilter)
  }

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category)
    filterProducts(searchTerm, category)
  }

  const filterProducts = (search, category) => {
    let filtered = products

    if (search) {
      filtered = filtered.filter((product) => product.nome.toLowerCase().includes(search.toLowerCase()))
    }

    if (category !== "Todos") {
      filtered = filtered.filter((product) => product.categoria === category)
    }

    setFilteredProducts(filtered)
  }

  // Open modal for new product
  const handleNewProduct = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      category: "",
      price: "",
      description: "",
      selectedColors: [],
      selectedSizes: [],
      ativo: true,
    })
    setIsModalOpen(true)
  }

  // Edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.nome,
      category: product.categoria,
      price: product.preco.toString(),
      description: product.descricao || "",
      selectedColors: product.cores || [],
      selectedSizes: product.tamanhos || [],
      ativo: product.ativo,
    })
    setIsModalOpen(true)
  }

  const handleSaveProduct = async () => {
    // Validations
    if (!formData.name || formData.name.length < 3) {
      alert("Nome é obrigatório e deve ter pelo menos 3 caracteres")
      return
    }

    if (!formData.price) {
      alert("Preço é obrigatório")
      return
    }

    if (formData.selectedColors.length === 0) {
      alert("Selecione pelo menos 1 cor")
      return
    }

    if (formData.selectedSizes.length === 0) {
      alert("Selecione pelo menos 1 tamanho")
      return
    }

    try {
      setSaving(true)

      const productData = {
        nome: formData.name,
        categoria: formData.category,
        preco: Number.parseFloat(formData.price),
        descricao: formData.description,
        cores: formData.selectedColors,
        tamanhos: formData.selectedSizes,
        ativo: formData.ativo,
        imagem_url: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(formData.name.toLowerCase())}`,
      }

      const method = editingProduct ? "PUT" : "POST"
      const url = editingProduct ? `/api/produtos/${editingProduct.id}` : "/api/produtos"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      setIsModalOpen(false)
      alert("Produto salvo com sucesso! ✅")
      await loadProducts()
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
      alert("Erro ao salvar produto")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    try {
      const response = await fetch(`/api/produtos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      alert("Produto excluído com sucesso!")
      await loadProducts()
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      alert("Erro ao excluir produto")
    }
  }

  const handleDuplicateProduct = async (product) => {
    try {
      const duplicatedData = {
        nome: `${product.nome} (Cópia)`,
        categoria: product.categoria,
        preco: product.preco,
        descricao: product.descricao,
        cores: product.cores,
        tamanhos: product.tamanhos,
        ativo: product.ativo,
        imagem_url: product.imagem_url,
      }

      const response = await fetch("/api/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(duplicatedData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      alert("Produto duplicado com sucesso!")
      await loadProducts()
    } catch (error) {
      console.error("Erro ao duplicar produto:", error)
      alert("Erro ao duplicar produto")
    }
  }

  // Mass selection
  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id))
    }
  }

  const handleBulkStatusChange = async (ativo) => {
    try {
      const response = await fetch("/api/produtos/bulk", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: selectedProducts,
          ativo: ativo,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      setSelectedProducts([])
      alert(`Produtos ${ativo ? "ativados" : "desativados"} com sucesso!`)
      await loadProducts()
    } catch (error) {
      console.error("Erro ao alterar status dos produtos:", error)
      alert("Erro ao alterar status dos produtos")
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Nome,Categoria,Preço,Status\n" +
      filteredProducts.map((p) => `${p.nome},${p.categoria},${p.preco},${p.ativo ? "Ativo" : "Inativo"}`).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "produtos-gaby-summer.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (ativo) => {
    return ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Produtos - Coleção Verão 2024</h1>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <Button
              onClick={handleNewProduct}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>

            <div className="flex gap-2">
              {selectedProducts.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleBulkStatusChange(true)}>
                    Ativar Selecionados
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkStatusChange(false)}>
                    Desativar Selecionados
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar produto..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category filters */}
              <div className="flex gap-2">
                <Button
                  variant={categoryFilter === "Todos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryFilter("Todos")}
                  className={categoryFilter === "Todos" ? "bg-orange-500 hover:bg-orange-600" : ""}
                >
                  Todos
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={categoryFilter === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryFilter(category)}
                    className={categoryFilter === category ? "bg-orange-500 hover:bg-orange-600" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Carregando produtos...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="p-4 text-left font-medium text-gray-900">Imagem</th>
                      <th className="p-4 text-left font-medium text-gray-900">Nome</th>
                      <th className="p-4 text-left font-medium text-gray-900">Categoria</th>
                      <th className="p-4 text-left font-medium text-gray-900">Preço</th>
                      <th className="p-4 text-left font-medium text-gray-900">Status</th>
                      <th className="p-4 text-left font-medium text-gray-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={() => handleSelectProduct(product.id)}
                          />
                        </td>
                        <td className="p-4">
                          <img
                            src={product.imagem_url || "/placeholder.svg"}
                            alt={product.nome}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        </td>
                        <td className="p-4 font-medium text-gray-900">{product.nome}</td>
                        <td className="p-4 text-gray-600">{product.categoria}</td>
                        <td className="p-4 text-gray-900 font-medium">R$ {product.preco?.toFixed(2)}</td>
                        <td className="p-4">
                          <Badge className={getStatusBadge(product.ativo)}>{product.ativo ? "Ativo" : "Inativo"}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDuplicateProduct(product)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">Nenhum produto encontrado</div>
            )}
          </CardContent>
        </Card>

        {/* Product Form Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do produto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Biquíni Sunset"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0,00"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  />
                  <Label htmlFor="ativo">Produto ativo</Label>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o produto..."
                  rows={3}
                />
              </div>

              {/* Available Colors */}
              <div>
                <Label>Cores Disponíveis *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {colors.map((color) => (
                    <div key={color.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={color.value}
                        checked={formData.selectedColors.includes(color.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, selectedColors: [...formData.selectedColors, color.value] })
                          } else {
                            setFormData({
                              ...formData,
                              selectedColors: formData.selectedColors.filter((c) => c !== color.value),
                            })
                          }
                        }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.value }}
                      ></div>
                      <Label htmlFor={color.value} className="text-sm">
                        {color.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <Label>Tamanhos *</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {sizes.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={size}
                        checked={formData.selectedSizes.includes(size)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, selectedSizes: [...formData.selectedSizes, size] })
                          } else {
                            setFormData({
                              ...formData,
                              selectedSizes: formData.selectedSizes.filter((s) => s !== size),
                            })
                          }
                        }}
                      />
                      <Label htmlFor={size} className="text-sm font-medium">
                        {size}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveProduct}
                  disabled={saving}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Back to Dashboard */}
        <div className="mt-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/dashboard")}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            ← Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
