pragma solidity ^0.4.0;


contract Ballot {
    // Struct declares a new complex type
    // This type will represent a single voter
    struct Voter {
        bool eligible; // if true, that person can vote in this ballot
        bool voted; // if true, that person already voted
        uint vote; // index of the proposal voted for
    }

    // This is a type for a single proposal
    struct Proposal {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    // creator of the ballot
    address public chairperson;

    // This declares a state variable that
    // maps a `Voter` struct to each possible address.
    mapping(address => Voter) public voters;

    // A dynamically-sized array of `Proposal` structs
    Proposal[] public proposals;

    // state variable to keep track of Ballot voting status.
    // One of: 'open', 'closed'
    bytes32 public status;

    // Initialize a new Ballot
    function Ballot() {
        chairperson = msg.sender;
        voters[chairperson].eligible = true;
    }

    // Open voting on provided proposals.
    // May only be called by `chairperson`
    function registerProposal(bytes32[] proposalNames) {
        // Don't allow proposals to be added once voting begins
        // or by anyone except the `chairperson`
        if (status == 'open' || msg.sender != chairperson) throw;
        // For each of the provided proposal names,
        // create a new Proposal object and add it
        // to the end of the proposals array
        for (uint i = 0; i < proposalNames.length; i++) {
            // `Proposal({...})` creates a temporary
            // Proposal object and `proposals.push(...)`
            // appends it to the end of `proposals`
            proposals.push(Proposal({
            name: proposalNames[i],
            voteCount: 0
            }));
        }
        // open voting
        status = 'open';
    }

    // Give each `voter` in `voterArray` the right to
    // vote on this ballot.
    // May only be called by `chairperson`
    function registerVoter(address[] voterArray) {
        // Throw an error if function is called by
        // anyone except this ballot's `chairperson`
        if (msg.sender != chairperson) throw;
        // else...
        for (uint i = 0; i < voterArray.length; i++) {
            // register each voter provided in `voterArray`
            voters[voterArray[i]].eligible = true;
        }
    }

    // Give your vote to proposal `proposals[proposal].name`
    function vote(uint proposal) {
        Voter sender = voters[msg.sender];
        // if sender has already voted or
        // if sender is not eligible to vote
        // throw error
        if (sender.voted || !sender.eligible) throw;

        // mark sender as having already voted
        sender.voted = true;
        // record sender's vote
        sender.vote = proposal;

        // If `proposal` is out of the range of the array,
        // this will throw automatically and revert all changes.
        // Otherwise, increment total votes for given `proposal`
        proposals[proposal].voteCount++;
    }

    // @dev Computes the winning proposal by
    // tallying all previous votes.
    function winningProposal() constant returns (uint) {
        uint winningVoteCount = 0;
        uint winningProposal;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal = p;
            }
        }
        return winningProposal;
    }

    // Calls winningProposal() function to get the index
    // of the winner contained in the proposals array then
    // returns the name of the winner
    function winner() constant returns (bytes32) {
        return proposals[winningProposal()].name;
    }

    function endBallot() constant returns (bytes32) {
        // close voting
        status = 'closed';
        // return the name of the winning proposal
        return winner();
    }
}
