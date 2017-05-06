var UICloudSharingPermissionAllowPublic = require('UIKit').UICloudSharingPermissionAllowPublic,
    UICloudSharingPermissionAllowPrivate = require('UIKit').UICloudSharingPermissionAllowPrivate,
    UICloudSharingPermissionAllowReadOnly = require('UIKit').UICloudSharingPermissionAllowReadOnly,
    UICloudSharingPermissionAllowReadWrite = require('UIKit').UICloudSharingPermissionAllowReadWrite,
    UIImagePNGRepresentation = require('UIKit').UIImagePNGRepresentation,
    UICloudSharingController = require('UIKit/UICloudSharingController'),
    UIImage = require('UIKit/UIImage'),
    CKModifyRecordsOperation = require('CloudKit/CKModifyRecordsOperation'),
    CKRecord = require('CloudKit/CKRecord'),
    CKRecordID = require('CloudKit/CKRecordID'),
    CKAsset = require('CloudKit/CKAsset'),
    CKShare = require('CloudKit/CKShare'),
    CKContainer = require('CloudKit/CKContainer'),
    NSSearchPathForDirectoriesInDomains = require('Foundation').NSSearchPathForDirectoriesInDomains,
    NSDocumentDirectory = require('Foundation').NSDocumentDirectory,
    NSUserDomainMask = require('Foundation').NSUserDomainMask,
    NSDataWritingAtomic = require('Foundation').NSDataWritingAtomic,
    NSOperationQueue = require('Foundation/NSOperationQueue'),
    NSURL = require('Foundation/NSURL'),
    TiApp = require('Titanium/TiApp');

exports.PERMISSION_ALLOW_PUBLIC = UICloudSharingPermissionAllowPublic;

exports.PERMISSION_ALLOW_PRIVATE = UICloudSharingPermissionAllowPrivate;

exports.PERMISSION_ALLOW_READ_ONLY = UICloudSharingPermissionAllowReadOnly;

exports.PERMISSION_ALLOW_READ_WRITE = UICloudSharingPermissionAllowReadWrite;

exports.createShareItem = function(args) {
    var filename = args.filename;
    var id = args.id;
    var label = args.label;
    var type = args.type;
  
    // Create image record
    var newRecord = CKRecord.alloc().initWithRecordTypeRecordID('ImageRecord', CKRecordID.alloc().initWithRecordName(id));
    var image = UIImage.imageNamed(fileName);

    // Write to filesystem
    var paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, true);
    var documentDirectory = paths[0];
    var imageFilePath = documentDirectory.appendingPathComponent(fileName);
    var myUrl = NSURL.fileURLWithPath(imageFilePath);

    try {
        var data = UIImagePNGRepresentation(image);
        data.writeToOptions(myUrl, NSDataWritingAtomic);
        var asset = CKAsset.alloc().initWithFileURL(myUrl);
        
        newRecord['image'] = asset
    } catch(e) {
        Ti.API.error('Could not write to filesystem: ' + e)
    }

    // Initialize cloud sharing
    var share = CKShare.alloc().initWithRootRecord(newRecord);
    share.setObjectForKey(filename + '.png', CKShareTitleKey);
    share.setObjectForKey(type, CKShareTypeKey);
    
    return share;
};

exports.openShareDialog = function(args) {
    var item = args.items;
    var permissions = args.permissions || [];
    var timeoutIntervalForRequest = args.timeoutIntervalForRequest || 10;
    var timeoutIntervalForResource = args.timeoutIntervalForResource || 10;
    
    if (item == null) {
        Ti.API.error('No item specified, aborting...');
        return;
    }
    
    var cloudSharingController = UICloudSharingController.alloc().initWithPreparationHandler(function(controller, preparationCompletionHandler) {
        // Prepare records
        var modifyRecordsOperation = CKModifyRecordsOperation.alloc().initWithRecordsToSaveRecordIDsToDelete(item, null);

        modifyRecordsOperation.timeoutIntervalForRequest = timeoutIntervalForRequest;
        modifyRecordsOperation.timeoutIntervalForResource = timeoutIntervalForResource;

        modifyRecordsOperation.modifyRecordsCompletionBlock(function(records, recordIDs, error) {
            if (error) {
                Ti.APO.error('Error: ' + error.localizedDescription);
            }
            
            preparationCompletionHandler(item, CKContainer.default(), error);
        });

        NSOperationQueue.mainQueue.addOperation(modifyRecordsOperation);
    });
    
    // TODO: Set sharing delegate
    // cloudSharingController.delegate = self
    
    // Set sharing permissions
    cloudSharingController.availablePermissions = permissions;
    
    // Show cloud shareing dialog
    TiApp.app().showModalController(cloudSharingController, true);
};
