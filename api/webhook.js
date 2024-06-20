import { supabase } from '../../supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { event, data } = req.body;

    // וודא שה-webhook מתקבל מ-Green Invoice ושהתשלום מאושר
    if (event === 'payment_succeeded' && data.status === 'paid') {
      const { user_id, course_id } = data.metadata; // נניח שהעברנו את המידע הזה בזמן יצירת התשלום

      // הוספת הרשמה לקורס רק אם התשלום עבר בהצלחה
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user_id,
          course_id: course_id,
        });

      if (error) {
        throw error;
      }
    }

    res.status(200).json({ message: 'Webhook received successfully.' });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ message: error.message });
  }
}
