## TrackingBlockComponent

This component is responsible for generating the HTML necessary to display a tracking block component in one of these two states: interactive, readonly.

It also handles the unfurling of listed issues in the same way dotcom does.

**Tech Debt**:

- It doesn't have enough context to know how to unfurl or not a link based on the current users permission yet

**Preview**:

- If you're running dotcom on localhost in the default port, use the this: [preview tracking block](http://github.localhost/rails/view_components/tracking_blocks/tracking_block_component) link.

- Otherwise, simply append this to your localhost root: _(github.localhost:random-port)_ `/rails/view_components/tracking_blocks/tracking_block_component`

---

### Component usage

```rb
render TrackingBlocks::TrackingBlockComponent.new(**params)
```

To check the params, please open the equivalent file
