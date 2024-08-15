import React from 'react';
import styled, { keyframes } from 'styled-components';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import VisionIcon from '@mui/icons-material/Visibility';
import OfferIcon from '@mui/icons-material/LocalOffer';
import MotivationIcon from '@mui/icons-material/EmojiObjects';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Header = styled.header`
  direction: ltr;
  text-align: left;
`;

const Container = styled.div`
  position: relative;
  width: 90%;
  max-width: 1200px;
  margin: 2rem auto;
  border-radius: 20px;
  padding: 30px;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  box-shadow: 0 10px 25px rgba(31, 38, 135, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Heebo', sans-serif;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
  text-align: right;
`;

const GeometricShape = styled.div`
  position: absolute;
  background: ${props => props.color || '#f0f0f0'};
  opacity: 0.5;
  border-radius: 50%;
`;

const TopLeftCircle = styled(GeometricShape)`
  width: 200px;
  height: 200px;
  top: -100px;
  left: -100px;
`;

const BottomRightCircle = styled(GeometricShape)`
  width: 300px;
  height: 300px;
  bottom: -150px;
  right: -150px;
`;

const ProfileImage = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 4px solid #62238C;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-weight: 900;
  font-size: 2.5rem;
  color: #62238C;
  letter-spacing: 1px;
  text-align: right;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: #0D0D0D;
  text-align: center;
  margin-bottom: 2rem;
`;

const Section = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  justify-content: flex-end; // יישור לימין
  font-size: 1.3rem;
  color: #62238C;
  margin-bottom: 1rem;

  svg {
    margin-left: 0.5rem;
    font-size: 1.5rem;
  }
`;

const SectionContent = styled.div`
  font-size: 1rem;
  color: #0D0D0D;
  text-align: right;
  direction: rtl;
`;

const List = styled.ul`
  text-align: right;
  direction: rtl;
  padding-right: 1.5rem;
`;

const AboutPage = () => {
  return (
    <Container>
      <TopLeftCircle color="#62238C" />
      <BottomRightCircle color="#9D4EDD" />
      
      <ProfileImage src="https://res.cloudinary.com/dsoh3yteb/image/upload/v1723584593/%D7%AA%D7%9E%D7%95%D7%A0%D7%94_%D7%A2%D7%99%D7%93%D7%95_cjrzxy.png" alt="עידו שגב" />
      <Title>קצת עלי</Title>
      <Subtitle>מומחה בינה מלאכותית, יזם, ומרצה</Subtitle>

      <Section>
        <SectionTitle><PersonIcon /> רקע אישי</SectionTitle>
        <SectionContent>
          <p>שמי עידו שגב, בן 37, נשוי ואב גאה ל-3 ילדים מקסימים. אני מתגורר באשקלון, עיר החוף היפהפייה בדרום הארץ. מאז שהבינה המלאכותית הפכה לחלק בלתי נפרד מחיינו, מצאתי את עצמי שוקע עמוק בעולם המרתק הזה. אני עוסק במגוון רחב של היבטים בתחום ה-AI, החל מהעברת סדנאות מעשיות לעסקים, רשויות ציבוריות וארגונים פרטיים, ועד להטמעת מערכות בינה מלאכותית מתקדמות. בנוסף, אני מרצה במכללת אולטימה, שם אני חולק את הידע והניסיון שלי עם הדור הבא של אנשי המקצוע בתחום הבינה המלאכותית.</p>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle><WorkIcon /> ניסיון ומקצועיות</SectionTitle>
        <SectionContent>
          <p>במהלך הקריירה שלי, צברתי ניסיון עשיר בתפקידים בכירים בחברות המובילות במשק הישראלי. כיום, אני גאה להוביל כמנכ"ל את חברת Triroars, ובמקביל אני מכהן כמנכ"ל חטיבת ה-AI בחברת KA. עם למעלה מ-15 שנות ניסיון בתחום, התמחיתי בניהול והטמעה של מערכות בינה מלאכותית ואוטומציה בארגונים מובילים. הניסיון הרב שצברתי מאפשר לי להביא פתרונות AI מתקדמים ומותאמים אישית לצרכים הייחודיים של כל ארגון, תוך שילוב של חדשנות טכנולוגית עם הבנה עמוקה של צרכי העסק.</p>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle><VisionIcon /> חזון ואמונות</SectionTitle>
        <SectionContent>
          <p>אני מאמין בכל לבי שהבינה המלאכותית היא לא רק כלי טכנולוגי, אלא מפתח להעצמה אישית ומקצועית. חזוני הוא שכל אדם, ללא קשר לתחום העיסוק שלו, יוכל להשתמש בבינה המלאכותית כחלק אינטגרלי מארגז הכלים שלו. אני שואב השראה מהמשפט המפורסם של אלברט איינשטיין: "דמיון חשוב יותר מידע, כי ידע הוא מוגבל, אבל הדמיון מקיף את העולם." משפט זה מנחה אותי בעבודתי היומיומית ומדרבן אותי לקדם את תחום הבינה המלאכותית באופן שיהיה נגיש ומועיל לכלל האוכלוסייה.</p>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle><OfferIcon /> מה אנחנו מציעים</SectionTitle>
        <SectionContent>
          <p>כחלק מהמחויבות שלי לקידום תחום הבינה המלאכותית, אני מציע מגוון רחב של שירותים:</p>
          <List>
            <li>סדנאות והדרכות מקצועיות</li>
            <li>הטמעת מערכות AI</li>
            <li>אוטומציה חכמה</li>
            <li>ייעוץ אסטרטגי</li>
            <li>הובלת קהילות מקצועיות</li>
          </List>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle><MotivationIcon /> המוטיבציה שלי</SectionTitle>
        <SectionContent>
          <p>המוטיבציה שלי נובעת מתשוקה עמוקה להביא את הבינה המלאכותית לקדמת הבמה ולהדגים כיצד היא יכולה לשפר באופן משמעותי את החיים המקצועיים והאישיים של כל אדם. אני רואה בעבודתי שליחות - להנגיש את הטכנולוגיה המתקדמת הזו לכל שכבות החברה ולפתח כלים שיתאימו למגוון רחב של צרכים.</p>
          <p>האתגר של גישור על הפער בין הטכנולוגיה המורכבת לבין היישום היומיומי שלה מניע אותי להמשיך ללמוד, לחדש ולהתפתח. אני מאמין שבאמצעות חינוך, הדרכה ויישום נכון של AI, נוכל ליצור עתיד טוב יותר - עתיד שבו טכנולוגיה משרתת את האנושות ומעצימה את היכולות האנושיות, במקום להחליף אותן.</p>
        </SectionContent>
      </Section>
    </Container>
  );
};

export default AboutPage;
