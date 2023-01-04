import React, { Component } from "react";
import axios from "axios";

class Fib extends Component {
  // Set initial state
  state = {
    seenIndexes: [],
    values: {},
    index: "",
  };

  // Call helper methods when component is mounted
  componentDidMoun() {
    this.fetchValues();
    this.fetchIndexes();
  }

  // Get all values from the database and set state
  async fetchValues() {
    const values = await axios.get("/api/values/current");
    this.setState({ values: values.data });
  }

  // Get all indexes from the database and set state
  async fetchIndexes() {
    const seenIndexes = await axios.get("/api/values/all");
    this.setState({ seenIndexes: seenIndexes.data });
  }

  // Handle form submission
  handleSubmit = async (event) => {
    event.preventDefault();

    await axios.post("/api/values", {
      index: this.state.index,
    });
    this.setState({ index: "" });
  };

  // Function to render all seen indexes
  renderSeenIndexes() {
    return this.state.seenIndexes.map(({ number }) => number).join(", ");
  }

  // Function to render all calculated values
  renderCalculatedValues() {
    const entries = [];

    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {this.state.values[key]}
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit()}>
          <label>Enter your index:</label>
          <input
            value={this.state.index}
            onChange={(event) => this.setState({ index: event.target.value })}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes I have seen:</h3>
        {this.state.renderSeenIndexes()}

        <h3>Calculated Values:</h3>
        {this.state.renderCalculatedValues()}
      </div>
    );
  }
}

export default Fib;
