import React from 'react';
import { Container } from 'components/common';
import dev from 'assets/illustrations/skills.svg';
import { Skill } from 'components/landing/Skill';
import { Wrapper, SkillsWrapper, SkillsWrapperRow, SkillsWrapperColumn, Details, Thumbnail } from './styles';
import skills from './skills.json';

export const Skills = () => (
  <Wrapper id="skills">
    <SkillsWrapper as={Container}>
      <Thumbnail>
        <img src={dev} alt="I’m Rafa and I’m a Junior Backend engineer!" />
      </Thumbnail>
      <Details>
        <h1>My hard skills</h1>
        <SkillsWrapperRow as={Container}>
          <SkillsWrapperColumn as={Container}>
            {[...skills].splice(0, (skills.length + 1) / 2).map(({ id, name, icon, color, level, percentage }) => (
              <Skill key={id} name={name} icon={icon} color={color} level={level} percentage={percentage} />
            ))}
          </SkillsWrapperColumn>
          <SkillsWrapperColumn as={Container}>
            {[...skills].splice((skills.length + 1) / 2).map(({ id, name, icon, color, level, percentage }) => (
              <Skill key={id} name={name} icon={icon} color={color} level={level} percentage={percentage} />
            ))}
          </SkillsWrapperColumn>
        </SkillsWrapperRow>

        <p>
          Few stuff that I've learned through the years, heavily focusing on backend technologies, but with a lot of
          curiosities on new trends (like React and Dart).
        </p>
      </Details>
    </SkillsWrapper>
  </Wrapper>
);
