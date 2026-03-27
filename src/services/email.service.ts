export const sendReviewEmail = async (to: string, clientName: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, clientName }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
          throw new Error(data.error);
      }
      
      return true;
    } catch (error) {
      console.error('Error al solicitar envío de correo:', error);
      return false;
    }
  };