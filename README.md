# Crypsydra

### Streaming Payments for NEO N3

**Why streaming payments?**

- *When paying for a service or subscription*

    You want to pay after the service is delivered but the other party wants payment up front

    Risk: payment is made but service is not delivered

- *When doing contract work/commissions over a period of time*

    You want payment up front but the other party wants to wait until the work is done

    Risk: service is delivered but payment is not made

**Streaming payments in action:**

- Sender puts all the funds into a smart contract up front, setting a start time, end time and an amount
- The amount the receiver can withdraw from the contract increases every second until 100% is reached at the stream end time
- Sender or recipient can cancel the stream at any time, paying the pro-rated amount to the receiver and returning the remaining funds to the sender

**Benefits:**

- Receiver is protected against starting work the sender doesn't intend to pay for - they can check the stream in the contract to ensure payment is still actively accruing
- Sender is protected against receiver skipping out with the full payment without doing the work - they can cancel the stream if the receiver is not producing the desired results
