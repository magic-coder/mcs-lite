import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import P from '../P';
import Heading from '../Heading';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  > div {
    width: 100%;
  }

  > div + div {
    margin-top: 10px;
  }
`;

export const StyledHeading = styled(Heading)`
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin-top: 5px;
`;

const DisplayMultipleValue = ({ items, ...otherProps }) => (
  <Container {...otherProps}>
    {items.map(({ name, value }) => (
      <div key={name}>
        <P color="grayDark">{name}</P>
        <StyledHeading color="primary">{value}</StyledHeading>
      </div>
    ))}
  </Container>
);

DisplayMultipleValue.displayName = 'DisplayMultipleValue';
DisplayMultipleValue.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    }),
  ).isRequired,
};

export default DisplayMultipleValue;
