import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import axios from 'axios';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';

import makeSelectHome from './selectors';
import reducer from './reducer';
import saga from './saga';
import './styles/styles.css';

import { Table } from "antd";
import Multiselect from 'multiselect-react-dropdown';

export function Home() {
  useInjectReducer({ key: 'home', reducer });
  useInjectSaga({ key: 'home', saga });

  const [listOfAgents, setListOfAgents] = useState([]);
  const [durationRange, setDurationRange] = useState({
    maximum: 0,
    minimum: 0,
  });

  const [minDuration, setMinDuration] = useState(0);
  const [maxDuration, setMaxDuration] = useState(0);
  const [inputAgentList, setInputAgentList] = useState([]);
  const [filterResult, setFilterResult] = useState([]);
  const [isFilterRequested, setIsFilterRequested] = useState(false)


  const agentListColumn = [
    {
      title: "Agent Name",
      key: 'index',
      onFilter: (value, record) => record.name.indexOf(value) === 0,
      sorter: (a, b) => (a.name > b.name ? -1 : 1),
    },
  ];

  const filterAgentListColumn = [
    {
      title: "Agent Name",
      dataIndex: 'agent_id',
      key: 'agent_id',
      sorter: (a, b) => (a.name > b.name ? -1 : 1),
    },
    {
      title: 'Call ID',
      dataIndex: 'call_id',
      key: 'call_id',
      defaultSortOrder: "descend",
      sorter: (a, b) => a.call_id - b.call_id
    },
    {
      title: 'Call Time',
      dataIndex: 'call_time',
      key: 'call_time',
      defaultSortOrder: "descend",
      sorter: (a, b) => a.call_time - b.call_time
    }
  ];

  useEffect(() => {
    const getListOfAgents = async () => {
      try {
        const resp = await axios.get(
          'https://damp-garden-93707.herokuapp.com/getlistofagents',
        );
        setListOfAgents(resp.data.data.listofagents);

        const options = [];
        let i = 0;
        resp.data.data.listofagents.forEach(item => {
          options.push({ name: item, id: i });
          i++;
        });
      } catch (error) {
        console.error(error);
      }
    };
    const getDurationRange = async () => {
      try {
        const resp = await axios.get(
          'https://damp-garden-93707.herokuapp.com/getdurationrange',
        );
        setDurationRange(resp.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    getListOfAgents();
    getDurationRange();
  }, []);

  const getFilteredCalls = async () => {
    const reqBody = {
      info: {
        filter_agent_list: inputAgentList,
        filter_time_range: [parseFloat(minDuration), parseFloat(maxDuration)],
      },
    };
    const resp = await axios.post(
      'https://damp-garden-93707.herokuapp.com/getfilteredcalls',
      reqBody,
    );
    setFilterResult(resp.data.data);
    setIsFilterRequested(true);
    console.log('Response: ', resp.data.data);
  };

  const addFilterAgentName = e => {
    setInputAgentList(e);
    console.log('Data: ', e);
  };
  
  const handleClear = () => {
    setMinDuration(0);
    setMaxDuration(0);
    setInputAgentName('');
    setInputAgentList([]);
    setFilterResult([]);
  };

  return (
    <div>
      <h2>List of Agents</h2>
      <Table columns={agentListColumn} dataSource={listOfAgents}/>
      <h3>Filter</h3>
      <button type="button" onClick={getFilteredCalls}>
        Get Filtered Calls
      </button>
      <div className="">
        <h5>
          Duration Range: {durationRange.minimum.toFixed(2)} -{' '}
          {durationRange.maximum.toFixed(2)}
        </h5>
      </div>
      <Multiselect
        showArrow
        options={listOfAgents}
        isObject={false}
        onSelect={e => addFilterAgentName(e)}
        style={{ width: '100px' }}
      />
      <input
        type="number"
        value={minDuration}
        onChange={e => setMinDuration(e.target.value)}
      />
      <input
        type="number"
        value={maxDuration}
        onChange={e => setMaxDuration(e.target.value)}
      />
      <button type="button" onClick={handleClear}>
        Clear
      </button>
      {isFilterRequested ? <Table columns={filterAgentListColumn} dataSource={filterResult} /> : null}
    </div>
  );
}

Home.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  home: makeSelectHome(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(Home);
