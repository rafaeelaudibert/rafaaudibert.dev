import styled from 'styled-components';

export const ExperienceWrapper = styled.div`
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.11);
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: grid;
  grid-template:
    'name name icon' 25px
    'info info icon' 25px
    'description description description' auto
    / 2fr 2fr 1fr;

  .name {
    grid-area: name;
  }

  .info {
    grid-area: info;

    a {
      color: #ff6584;

      :hover {
        color: #ff4564;
        text-decoration: underline;
      }
    }
  }

  .icon {
    grid-area: icon;
    display: flex;
    justify-content: center;

    img {
      width: 45px;
      min-height: 45px;
      height: auto;
    }
  }

  .description {
    grid-area: description;
    font-size: 1rem;
    margin-bottom: 0;
  }
`;
