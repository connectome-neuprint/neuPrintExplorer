import { RankedTable } from './RankedTable';

const styles = { formControl: 'formControlClass' };
const { actions, React, renderer, submit } = global;

const neoServerSettings = {
  get: () => 'http://example.com'
};

const component = (
  <RankedTable
    availableROIs={['roiA', 'roiB', 'roiC']}
    dataSet="test"
    datasetstr="test"
    actions={actions}
    submit={submit}
    classes={styles}
    history={{ push: jest.fn() }}
    isQuerying={false}
    neoServerSettings={neoServerSettings}
    neoServer="testServer"
    isPublic={false}
  />
);

const componentPublic = (
  <RankedTable
    availableROIs={['roiA', 'roiB', 'roiC']}
    dataSet="test"
    datasetstr="test"
    actions={actions}
    submit={submit}
    classes={styles}
    history={{ push: jest.fn() }}
    isQuerying={false}
    neoServerSettings={neoServerSettings}
    neoServer="testServer"
    isPublic
  />
);

describe('RankedTable Plugin', () => {
  it('should have required details fields', () => {
    expect(RankedTable.details.name).toBeTruthy();
    expect(RankedTable.details.description).toBeTruthy();
  });
  it('renders correctly', () => {
    const pluginView = renderer.create(component).toJSON();
    expect(pluginView).toMatchSnapshot();
  });
  it('renders correctly in public mode', () => {
    const pluginViewPublic = renderer.create(componentPublic).toJSON();
    expect(pluginViewPublic).toMatchSnapshot();
  });
});
