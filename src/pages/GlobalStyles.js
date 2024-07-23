import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Heebo');
  
  body {
    font-family: 'Heebo', sans-serif;
    background-color: white;
    direction: rtl;
    margin: 0;
    padding: 0;
    height: 100%;
    overflow-y: auto;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

export default GlobalStyle;