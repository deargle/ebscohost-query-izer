// https://bootstrap-vue.org/docs#using-module-bundlers ----
import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';

import Journals from './ebscohost-journal-names-wildcard.csv';

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// other styles...
import './style.scss';

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

Journals.sort((a,b) => {
  let a_name = a.journal_name_display;
  let b_name = b.journal_name_display;
  if (a_name < b_name) {
    return -1;
  }
  if (b_name < a_name) {
    return 1
  }
  return 0
});
const journals_ft_50 = Journals.filter(x => x.is_ft_50 == 1)
const journals_ais_8 = Journals.filter(x => x.is_ais_8 == 1)

var app = new Vue({
  el : '#app',
  data: {
    journals: Journals,
    copied: false,
    expand_journal_list: false,
    filtered_journals: journals_ft_50,
    keywords: [],
    new_keyword: '',
    keyword_join: 'AND',
    show_keyword_bquery: false
  },
  computed: {
    filtered_journals_display_names: function() {
      if (!this.filtered_journals.length) {
        return '';
      }
      return this.filtered_journals.map(x => x.journal_name_display)
    },
    journals_bquery: function() {
      let journals_ebsco = this.filtered_journals.map(x => x.journal_name_ebsco);
      if (!!!journals_ebsco.length){
        return '';
      }
      return '(' + journals_ebsco.map(x => `JN "${x}"`).join(' OR ') + ')';
    },
    baseurl: function() {
      return 'https://search.ebscohost.com/login.aspx?direct=true&authtype=cookie,uid,ip&db=bth';
    },
    keyword_bquery: function() {
      if (!!!this.keywords.length) {
        return ''
      }
      return '(' + this.keywords.map(kw => `(KW "${kw}" OR AB "${kw}" OR TI "${kw}")`).join(` ${this.keyword_join} `) + ')';
    },
    bquery: function() {
      let elements = [];

      if (this.keyword_bquery) {
        elements.push(this.keyword_bquery)
      }

      if (this.journals_bquery){
        elements.push(this.journals_bquery)
      }

      return elements.join(' AND ');
    },
    url_with_bquery: function() {
      return `${this.baseurl}&bQuery=(${this.bquery})`;
    },
  },
  methods: {
    copy_to_clipboard: function(){
      let that = this;
      var promise = navigator.clipboard.writeText(this.bquery).then(function() {
        that.copied = true;
      })
    },
    select_all: function() {
      this.filtered_journals = this.journals;
    },
    select_none: function() {
      this.filtered_journals = [];
    },
    select_ft_50: function() {
      this.filtered_journals = journals_ft_50;
    },
    select_ais_8: function() {
      this.filtered_journals = journals_ais_8;
    },
    add_keyword: function(keyword) {
      this.keywords.push(this.new_keyword);
      this.new_keyword = '';
    },
    delete_keyword: function(index) {
      this.keywords.splice(index, 1);
    }
  }
})
