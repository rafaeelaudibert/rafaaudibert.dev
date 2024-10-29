/* eslint-disable global-require, import/no-dynamic-require */

import React from 'react';
import { Container } from 'components/common';
import { ExperienceWrapper } from './styles';

export const ExperienceCard = ({ name, where, whereLink, yearStart, yearEnd = 'currently', icon, description }) => {
  const img = require(`assets/img/${icon}`);

  return (
    <ExperienceWrapper as={Container}>
      <h3 className="name">{name}</h3>
      <small className="info">
        <a href={whereLink} target="_blank" rel="noopener noreferrer">
          {where}{' '}
        </a>{' '}
        | {yearStart} - {yearEnd}
      </small>
      <div className="icon">
        <img src={img} alt={name} />
      </div>
      <p className="description" dangerouslySetInnerHTML={{ __html: description.trim() }}/>
    </ExperienceWrapper>
  );
};
