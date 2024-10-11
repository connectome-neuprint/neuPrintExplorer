import React from 'react';
import renderer from 'react-test-renderer';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { sortRois, metaInfoError, TablePaginationActions } from '.';

const ROIList = [
  '123',
  'foo',
  'foo',
  'bar',
  '123',
  '12bar',
  'foo'
];
const ROIList2 = [
  'foo',
  'bar',
  '123',
  '12bar'
]

Enzyme.configure({adapter: new Adapter()});

function doNothing() {}

test('ROIs correctly sorted by sortRois', () => {
  expect(ROIList.sort(sortRois)).toEqual(["bar", "foo", "foo", "foo", "123", "123", "12bar"]);
  expect(ROIList2.sort(sortRois)).toEqual(["bar", "foo", "123", "12bar"]);
});

const errorMessage = 'the wheels fell off';
test('metaInfoError returns correct redux object', () => {
  expect(metaInfoError(errorMessage)).toEqual({
    type: 'META_INFO_ERROR',
    error: errorMessage
  });
});

test('TablePaginationActions shows next link disabled', () => {
  const raw = <TablePaginationActions count={50} onPageChange={doNothing} rowsPerPage={5} page={10} />;
  const component = renderer.create(raw);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  const wrapper = mount(raw);
  expect(wrapper.find('button').at(0).props().disabled).toBe(false);
  expect(wrapper.find('button').at(3).props().disabled).toBe(true);

});


