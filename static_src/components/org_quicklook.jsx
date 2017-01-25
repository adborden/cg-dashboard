
import React from 'react';

import style from 'cloudgov-style/css/cloudgov-style.css';
import createStyler from '../util/create_styler';

import AppCountStatus from './app_count_status.jsx';
import EntityIcon from './entity_icon.jsx';
import Loading from './loading.jsx';
import SpaceCountStatus from './space_count_status.jsx';
import SpaceQuicklook from './space_quicklook.jsx';
import orgActions from '../actions/org_actions.js';
import { orgHref } from '../util/url';

const propTypes = {
  org: React.PropTypes.object.isRequired,
  spaces: React.PropTypes.array
};

const defaultProps = {
  spaces: []
};

export default class OrgQuicklook extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.styler = createStyler(style);

    this.onRowClick = this.onRowClick.bind(this);
    this.onOrgClick = this.onOrgClick.bind(this);
  }

  onRowClick(ev) {
    ev.preventDefault();
    orgActions.toggleQuicklook(this.props.org);
  }

  onOrgClick(ev) {
    ev.preventDefault();
    window.location.href = this.orgHref();
  }

  orgHref() {
    return orgHref(this.props.org.guid);
  }

  totalAppCount(spaces) {
    return spaces.reduce((sum, space) => sum + space.app_count, 0);
  }

  allApps() {
    return this.props.spaces.reduce((all, space) => {
      if (space.apps && space.apps.length) {
        return all.concat(space.apps);
      }
      return all;
    }, []);
  }

  get spacesContent() {
    if (!this.props.org.quicklook || !this.props.org.quicklook.open) {
      return null;
    }

    if (!this.props.org.quicklook.isLoaded) {
      return <Loading />;
    }

    return this.props.spaces.map(space =>
      <SpaceQuicklook space={ space } orgGuid={ this.props.org.guid } key={ space.guid } />
    );
  }

  render() {
    const props = this.props;
    const panelStyle = props.org.quicklook && props.org.quicklook.open ?
      { marginBottom: '1rem' } :
      null;

    return (
      <div>
        <div style={ panelStyle } onClick={ this.onRowClick }
          className={ this.styler('panel-row-is_clickable', 'test-org-quicklook') }
        >
          <div className={ this.styler('panel-column') }>
            <h2 className={ this.styler('card-title-primary') }>
              <EntityIcon entity="org" iconSize="medium" />
              <a onClick={ this.onOrgClick }>{ props.org.name }</a>
            </h2>
          </div>
          <div className={ this.styler('panel-column') }>
            <div className={ this.styler('count_status_container') }>
              <SpaceCountStatus spaces={ props.org.spaces } />
              <AppCountStatus appCount={ this.totalAppCount(props.org.spaces) }
                apps={ this.allApps() }
              />
            </div>
          </div>
        </div>
        { this.spacesContent }
      </div>
    );
  }
}

OrgQuicklook.propTypes = propTypes;
OrgQuicklook.defaultProps = defaultProps;