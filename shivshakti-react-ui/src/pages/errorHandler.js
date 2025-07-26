// errorHandler.js

export function handleApiError(errorResponse) {
  if (!errorResponse) {
    alert('Unknown error occurred');
    return;
  }

  if (errorResponse.errors && Array.isArray(errorResponse.errors)) {
    // Validation errors
    const message = errorResponse.errors
      .map(err => `${capitalize(err.field)}: ${err.message}`)
      .join('\n');
    alert("Validation Errors:\n" + message);
  } else if (errorResponse.message) {
    // General error
    alert(errorResponse.message);
  } else {
    alert('An unexpected error occurred.');
  }
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
