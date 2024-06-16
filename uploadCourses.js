const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

// Supabase credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Path to the courses.json file
const coursesFilePath = path.join(__dirname, 'courses.json');

// Read the courses JSON file and upload to Supabase
const uploadCourses = async () => {
  try {
    const coursesData = fs.readFileSync(coursesFilePath, 'utf-8');
    const courses = JSON.parse(coursesData);

    for (const course of courses) {
      console.log('Uploading or updating course:', JSON.stringify(course, null, 2)); // הדפסה של הקורס הנוכחי עם כל הנתונים

      // Upload or update each course to Supabase
      const { data, error } = await supabase
        .from('courses')
        .upsert(course, { onConflict: ['id'] }); // שימו לב לתוספת של { onConflict: ['id'] }

      if (error) {
        console.error('Error uploading course:', error); // הדפסה של השגיאה
      } else {
        console.log('Course uploaded or updated successfully:', data);
      }
    }
  } catch (error) {
    console.error('Error reading courses file:', error);
  }
};

uploadCourses();
