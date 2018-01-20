# Ti.CloudSharing
Use the iOS 10+ `UICloudSharingController` in Appcelerator Titanium.

## Run the Sample

1. Copy the `ti.cloudsharing` folder to your `lib/` (Alloy) or your Resources (Classic) directory
2. Copy the example code to your Titanium app
3. Go for it!

## Example

```js
var CloudSharing = require('ti.cloudsharing');

var window = Ti.UI.createWindow({
  backgroundColor: '#fff'
});

var btn = Ti.UI.createButton({
  title: 'Show message!'
});

btn.addEventListener('click', function() {
  var cloudItem = CloudSharing.createShareItem({
    filename: 'titanium.png',
    label: 'Titanium Logo',
    type: 'com.appcelerator.cloudsharing'
  });
  
  CloudSharing.openShareDialog({
    item: cloudItem,
    permissions: [CloudSharing.PERMISSION_ALLOW_PUBLIC, CloudSharing.PERMISSION_ALLOW_READ_ONLY]
  });
});

window.add(btn);
window.open();
```

## License
MIT

## Copyright
&copy; 2017 by Appcelerator
