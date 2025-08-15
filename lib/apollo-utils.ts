// Utility functions for Apollo Client operations

/**
 * Recursively removes __typename fields and other Apollo-specific fields from objects
 * This is useful when sending Apollo-managed objects as input to GraphQL mutations
 */
export function removeTypenames(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeTypenames)
  }
  
  if (typeof obj === 'object') {
    const newObj: any = {}
    
    for (const key in obj) {
      // Skip only Apollo-specific fields that cause GraphQL input errors
      if (
        key === '__typename' ||
        key === '__ref' ||
        key === '__id'
      ) {
        continue
      }
      
      if (obj.hasOwnProperty(key)) {
        const value = obj[key]
        // Recursively clean nested objects
        newObj[key] = removeTypenames(value)
      }
    }
    
    return newObj
  }
  
  return obj
}

/**
 * Cleans an object to make it suitable for GraphQL input
 * Removes __typename and other Apollo-specific fields
 */
export function cleanForInput(obj: any): any {
  return removeTypenames(obj)
}

/**
 * Handles GraphQL errors and returns a user-friendly message
 */
export function getGraphQLErrorMessage(error: any): string {
  return error?.graphQLErrors?.[0]?.message || 
         error?.networkError?.message || 
         error?.message ||
         'An unexpected error occurred'
}