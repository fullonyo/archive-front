import { useMemo } from 'react'

export const useLoadingState = ({
  categoriesLoading,
  assetsLoading,
  categoryLoading,
  categoryId,
  isFirstPage
}) => {
  // Loading inicial - primeira carga das categorias
  const isInitialLoading = useMemo(() => {
    return categoriesLoading && !categoryId
  }, [categoriesLoading, categoryId])

  // Loading de categoria - ao navegar para uma categoria específica
  const isCategoryLoading = useMemo(() => {
    return categoryLoading || (categoryId && assetsLoading && isFirstPage)
  }, [categoryLoading, categoryId, assetsLoading, isFirstPage])

  // Loading de paginação - quando mudando de página (não primeira)
  const isPaginationLoading = useMemo(() => {
    return categoryId && assetsLoading && !isFirstPage
  }, [categoryId, assetsLoading, isFirstPage])

  // Loading principal que bloqueia a tela inteira
  const isMainLoading = useMemo(() => {
    return isInitialLoading || isCategoryLoading
  }, [isInitialLoading, isCategoryLoading])

  // Se qualquer loading está ativo
  const isAnyLoading = useMemo(() => {
    return isMainLoading || isPaginationLoading
  }, [isMainLoading, isPaginationLoading])

  return {
    isMainLoading,
    isInitialLoading,
    isCategoryLoading,
    isPaginationLoading,
    isAnyLoading
  }
}
