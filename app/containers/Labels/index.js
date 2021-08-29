import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/styles.css';
import { Table, Tag, Input, Select, Button } from 'antd';
import { Link } from 'react-router-dom';

const { Option } = Select;

const Labels = () => {
  const [callList, setCallList] = useState([]);
  const [labelsList, setLabelsList] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  // const [labelOps, setLabelOps] = useState('');
  const [inputName, setInputName] = useState('');
  const [opType, setOpType] = useState('add');
  const [opList, setOpList] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);

  const handleOpChange = op => {
    console.log('Value: ', op);
    setOpType(op);
  };

  const labelsListColumn = [
    {
      title: 'Labels',
      key: 'index',
      sorter: (a, b) => (a.name > b.name ? -1 : 1),
    },
  ];

  const callListColumn = [
    {
      title: 'Call ID',
      dataIndex: 'call_id',
      key: 'call_id',
      render: text => <p>{text + 1}</p>,
    },
    {
      title: 'Labels',
      key: 'label_id',
      dataIndex: 'label_id',
      render: label => (
        <span>
          {label.map(label => (
            <Tag key={label}>{label.toUpperCase()}</Tag>
          ))}
        </span>
      ),
    },
  ];

  const addedCallsColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Operation Type',
      dataIndex: 'op',
    },
    {
      title: 'Action',
      key: 'action',
      render: x => (
        <div size="middle">
          <Button onClick={() => handleRemoveFromOpList(x)} size="small">
            Remove
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    (async () => {
      const resp = await axios.get(
        'https://damp-garden-93707.herokuapp.com/getcalllist',
        { headers: { user_id: '24b456' } },
      );
      setCallList(resp.data.data.call_data);
      console.log('Call List: ', resp.data);
    })();
    (async () => {
      const resp = await axios.get(
        'https://damp-garden-93707.herokuapp.com/getlistoflabels',
        { headers: { user_id: '24b456' } },
      );
      setLabelsList(resp.data.data.unique_label_list);
      console.log('Lost of Labels: ', resp.data);
    })();
  }, [hasApplied]);

  const handleRemoveFromOpList = x => {
    console.log('index: ', x);
    const temp = opList.slice(opList.indexOf(x));
    if (opList.length <= 1) {
      setOpList([]);
    } else {
      setOpList(temp);
    }
    console.log('OpList: ', temp);
  };
  const onSelectChange = selectedRowKeys => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    setSelectedRows(selectedRowKeys);
  };

  const handleCallName = val => {
    console.log(val.target.value);
    setInputName(val.target.value);
  };
  const rowSelection = {
    selectedRows,
    onChange: onSelectChange,
  };
  const handleAddToApply = () => {
    setOpList([...opList, { name: inputName, op: opType }]);
    console.log('Op List: ', opList);
  };

  const handleApply = async () => {
    const resp = await axios.post(
      'https://damp-garden-93707.herokuapp.com/applyLabels',
      {
        operation: {
          callList: selectedRows,
          label_ops: opList,
        },
      },
      { headers: { user_id: '24b456' } },
    );
    console.log('Apply Labels: ', resp.data);
    setCallList(resp.data.data.call_data);
    setOpList([]);
    setHasApplied(!hasApplied);
  };

  return (
    <div className="part2">
      <div className="page2_body">
        <Button type="primary">
          <Link to="/">Goto Hone</Link>
        </Button>
        <Table
          rowSelection={rowSelection}
          columns={labelsListColumn}
          dataSource={labelsList}
        />
        <div className="operations">
          <div className="">
            <Input
              onChange={handleCallName}
              type="text"
              style={{ width: 300 }}
              prefix="Name: "
            />
            <div className="op_type">
              <label htmlFor="">Select Operation Type</label>
              <Select
                defaultValue="add"
                onChange={handleOpChange}
                style={{ width: 200 }}
              >
                <Option value="create">Create</Option>
                <Option value="add">Add</Option>
                <Option value="remove">Remove</Option>
              </Select>
            </div>
            <Button type="primary" onClick={handleAddToApply}>
              Add to Apply
            </Button>
            <Button type="primary" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
        <div className="">
          {opList.length ? <h2>Added Calls</h2> : null}
          {opList.length ? (
            <Table columns={addedCallsColumns} dataSource={opList} />
          ) : null}
        </div>
        <Table columns={callListColumn} dataSource={callList} />
      </div>
    </div>
  );
};

export default Labels;
