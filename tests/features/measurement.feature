Feature: Measurement API
  Backend API behavior for matched-cluster experiment setup and live readout (SLICE-12).

  Scenario: Go-live is blocked when a block is imbalanced
    Given an experiment with at least one imbalanced block
    When I request to go live
    Then the response status is 400
    And the response body has a non-empty blocked reason

  Scenario: Go-live succeeds once all blocks are balanced and cost is acknowledged
    Given an experiment with all blocks balanced
    When I acknowledge the cost of control
    And I request to go live
    Then the response status is 200
    And the experiment status is "live"

  Scenario: Moving a cluster to control clears its ML price recommendation
    Given a treatment cluster with an ML price recommendation
    When I move the cluster to control
    Then the response status is 200
    And the cluster's arm is "control"
    And the cluster's mlPrice is null

  Scenario: A live experiment reports a win verdict once its win-probability crosses the boundary
    Given a live experiment whose win-probability is above the win boundary
    When I request the experiment
    Then the response status is 200
    And the readout verdict is "win"
