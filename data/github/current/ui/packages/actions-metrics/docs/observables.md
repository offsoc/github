# What is the Observer Pattern?

The observer pattern is a publish/subscribe pattern. An observable will maintain a list of observers that subscribe to it. Upon a state change, this observable will notify all of the observers. An observable is a one-to-many type of dependency, one observable could have many subscribers.

Observables allow you to only rerender the parts of the virtual DOM that rely on the state of the observable value when it changes, instead of rerendering the entire component that contains the state.

# Observable Types

## ObservableValue

ObservableValue\<T\> is a simple wrapper around a value of type T that allows subscribing to changes to that value.

```ts
const myObservable = new ObservableValue<boolean>(false)
myObservable.subscribe(this.notify)
// Setting the value will trigger the notify function specified in the subscribe.
myObservable.value = true
```

NOTE: Notifications will be sent even if the value is updated to the current value.
##ObservableArray
ObservableArray\<T\> is similar, but allows for any array manipulations to notify subscribers.

```ts
const myObservableArray = new ObservableArray<number>([])
myObservableArray.subscribe(this.notify)
// pushing popping, or setting the value will trigger the notify function specified in the subscribe.
myObservableArray.push(5)
myObservableArray.pop()
myObservableArray.value = [5]
```

## ObservableObject

ObservableObject\<V> tracks a collection of key value pairs and notifies subscribers on adds or value changes.

```
interface IMessage { text: string };
const myObservableObject<IMessage> = new ObservableObject<IMessage>();
myObservableObject.subscribe(this.notify);
myObservaleObject.add("newObject", { text: "New Message" });
```

## ObservableCollection

ObservableCollection\<T> can take multiple instances of T[] or ObservableArray\<T> and flatten them into a single array. It handles subscribing to any changes in the underlying arrays that are observable and notifying subscribers of the aggregate array. The aggregate array is formed by the concatenation of the supplied arrays. This means the order of the items in the resulting array is determined by the order the arrays are added to the collection.

```ts
const myObservableArray1 = new ObservableArray<number>([1])
const myObservableArray2 = new ObservableArray<number>([2])
const myObservableCollection = new ObservableCollection<number>()
myObservableCollection.push(myObservableArray1)
myObservableCollection.push(myObservableArray2)
myObservableArray2.push(3)
console.log(myObservableCollection.value) // [1, 2, 3]
```

## ReadyableObservableArray

ReadyableObservableArray\<T> is an ObservableArray\<T> with an observable ready boolean. This allows an ObservableArray to indicate it is still in a loading state. This may be useful if the array is showing data loaded asynchronously from multiple sources and you want to prevent flickering as each set of items is added.

```ts
const breadcrumbItems = new ReadyableObservableArray<IBreadcrumbItem>();
const breadcrumbService = Services.getService<BreadcrumbService>("BreadcrumbService");
const allData = myService.getData();
for (let item in allData) {
    breadcrumbItems.push(proccessBreadcrumbItem(item))
}
breadcrumbItems.ready.value = true;

public render() {
    <Observer breadcrumbItems={breadcrumbItems} ready={breadcrumbItems.ready}>
        {(props) => {
            if (props.ready) {
                return <Breadcrumb items={props.breadcrumbItems}/>;
            } else {
                return this.showLoading();
            }
        }
    </Observer>
}

```

## ObservableLike

ObservableLike types can take the form of T | ObservableValue\<T> . The ObservableLike namespace offers functions that allow observable operations to be called on values that may or may not be observable. This is useful for components that optionally take observable values as props, they will not need to check if the value is observable every time it's used.

```ts
const observableBooleanValue = new ObservableValue<boolean>(true)
const booleanValue = false

ObservableLike.getValue(observableBooleanValue) // true, returns the observable's value,
ObservableLike.getValue(booleanValue) // false, the value is not observable so it is just returned

ObservableLike.subscribe(observableBooleanValue, this.onValueUpdate) // subscribes to updates on the ObservableValue
ObservableLike.subscribe(booleanValue, this.onValueUpdate) // the value is not observable, so this is a no-op
```

# Observer Component

Manually subscribing and unsubscribing to Observables within React components is error prone. It's easy to forget to unsubscribe in componentWillUnmount and then the subscription is leaked. To make managing the subscriptions easy, you should use the Observer component. The Observer takes Observable values as its props and passes the value of those observables as props to its child. It takes care of subscribing and unsubscribing on mount and unmount and any time the Observable changes. It also handles updating the subscriptions when a component receives new props from a state change in the parent.

The Observer should only have one child as it passes the current value of its props to that child. There are two models the Observer supports. The first and preferred model is a child function which is passed the props. This allows the child to perform processing on the props before passing them to its children and has the best performance characteristics.

```ts
this.clickCount = new ObservableValue<number>(0);
public render(): JSX.Element {
    return (
        <Observer count={this.clickCount}>
            {(props: { count: number }) => {
                const buttonText = "Clicked " + props.count + " times";
                return <Button text={buttonText} onClick={() => { this.clickCount.value = props.count + 1; }}/>
            }}
        </Observer>
    );
}
```

The second model is to place a child component directly into the observer. This is the simplest model and can be used when the props don't need any further processing. It only triggers a rerender of the top child, so if any of the descendants of that child need the observer props or rely on data being changed by the filter function, use a child function instead. There is a small performance hit here to clone the child and update it props.

```ts
this.checkboxChecked = new ObservableValue<boolean>(false);
public render(): JSX.Element {
        return (
            <Observer checked={this.checkboxChecked}>
                <Checkbox onClick={() => { this.checkboxChecked.value = !this.checkboxChecked.value; }}/>
            </Observer>
        );
    }
```

## ObservableExpressions

Observers can also take an ObservableExpression as props. ObservableExpressions allow you to specify which actions you want to subscribe to on an observableValue. They also allow you to call a filter function whenever an Observable value changes and return true or false from that function to determine if the child of the Observer should rerender. This can be useful in improving performance when the change in value doesn't effect the rendering of the children.

```ts
private dropdownButton = React.createRef<DropdownButton>();
private selection = new ObservableArray<number>();
private selectionObservable = { observableValue: this.selection, filter: this.onSelect };

public render(): JSX.Element {
    // We're not using the observable's value in this case, but we need to react to it changing.
    // ObservableExpressions give us a way to do that with the filter function.
    return (
        <Observer selection={selectionObservable}>
            {() => <DropdownButton ref={this.dropdownButton} />
        </Observer>
    );
}

this.onSelect = (): boolean => {
    // close the dropdown when a selection is made
    if (selection.value.length > 0) {
        if (this.dropdownButton.current) {
            this.dropdownButton.current.collapse();
        }
    }
    return true;
}

```
