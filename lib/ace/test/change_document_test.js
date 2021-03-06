/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Ajax.org Code Editor (ACE).
 *
 * The Initial Developer of the Original Code is
 * Ajax.org Services B.V.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *      Fabian Jakobs <fabian AT ajax DOT org>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

define(function(require, exports, module) {

require("./mockdom");

var Document        = require("../document").Document,
    Editor          = require("../editor").Editor,
    Text            = require("../mode/text").Mode,
    JavaScriptMode  = require("../mode/javascript").Mode,
    MockRenderer    = require("./mockrenderer"),
    assert          = require("./assertions");

var Test = {
    setUp : function() {
        this.doc1 = new Document(["abc", "def"].join("\n"));
        this.doc2 = new Document(["ghi", "jkl"].join("\n"));
        this.editor = new Editor(new MockRenderer());
    },

    "test: change document" : function() {
        this.editor.setDocument(this.doc1);
        assert.equal(this.editor.getDocument(), this.doc1);

        this.editor.setDocument(this.doc2);
        assert.equal(this.editor.getDocument(), this.doc2);
    },

    "test: only changes to the new document should have effect" : function() {
        var called = false;
        this.editor.onDocumentChange = function() {
            called = true;
        };

        this.editor.setDocument(this.doc1);
        this.editor.setDocument(this.doc2);

        this.doc1.duplicateLines(0, 0);
        assert.false(called);

        this.doc2.duplicateLines(0, 0);
        assert.true(called);
    },

    "test: should use cursor of new document" : function() {
        this.doc1.getSelection().moveCursorTo(0, 1);
        this.doc2.getSelection().moveCursorTo(1, 0);

        this.editor.setDocument(this.doc1);
        assert.position(this.editor.getCursorPosition(), 0, 1);

        this.editor.setDocument(this.doc2);
        assert.position(this.editor.getCursorPosition(), 1, 0);
    },

    "test: only changing the cursor of the new doc should not have an effect" : function() {
        this.editor.onCursorChange = function() {
            called = true;
        };

        this.editor.setDocument(this.doc1);
        this.editor.setDocument(this.doc2);
        assert.position(this.editor.getCursorPosition(), 0, 0);

        var called = false;
        this.doc1.getSelection().moveCursorTo(0, 1);
        assert.position(this.editor.getCursorPosition(), 0, 0);
        assert.false(called);

        this.doc2.getSelection().moveCursorTo(1, 1);
        assert.position(this.editor.getCursorPosition(), 1, 1);
        assert.true(called);
    },

    "test: should use selection of new document" : function() {
        this.doc1.getSelection().selectTo(0, 1);
        this.doc2.getSelection().selectTo(1, 0);

        this.editor.setDocument(this.doc1);
        assert.position(this.editor.getSelection().getSelectionLead(), 0, 1);

        this.editor.setDocument(this.doc2);
        assert.position(this.editor.getSelection().getSelectionLead(), 1, 0);
    },

    "test: only changing the selection of the new doc should not have an effect" : function() {
        this.editor.onSelectionChange = function() {
            called = true;
        };

        this.editor.setDocument(this.doc1);
        this.editor.setDocument(this.doc2);
        assert.position(this.editor.getSelection().getSelectionLead(), 0, 0);

        var called = false;
        this.doc1.getSelection().selectTo(0, 1);
        assert.position(this.editor.getSelection().getSelectionLead(), 0, 0);
        assert.false(called);

        this.doc2.getSelection().selectTo(1, 1);
        assert.position(this.editor.getSelection().getSelectionLead(), 1, 1);
        assert.true(called);
    },

    "test: should use mode of new document" : function() {
        this.editor.onDocumentModeChange = function() {
            called = true;
        };
        this.editor.setDocument(this.doc1);
        this.editor.setDocument(this.doc2);

        var called = false;
        this.doc1.setMode(new Text());
        assert.false(called);

        this.doc2.setMode(new JavaScriptMode());
        assert.true(called);
    }
};

module.exports = require("async/test").testcase(Test);
});

if (module === require.main) {
    require("../../../support/paths");
    exports.exec()
}
